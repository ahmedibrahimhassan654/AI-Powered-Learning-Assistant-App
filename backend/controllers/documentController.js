import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quize from "../models/Quize.js";
import fs from "fs/promises";
import path from "path";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import {
  analyzePDFWithAI,
  fixGarbledPagesWithAI,
} from "../utils/geminiService.js";

// @desc    Upload a new document
// @route   POST /api/document/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("يرجى رفع ملف");
    }

    const { originalname, filename, path: filepath, size: filesize } = req.file;

    console.log(`Uploading file: ${originalname}`);
    console.log(`Title provided: ${req.body.title || "No Title"}`);

    // Create document record
    let document = await Document.create({
      user: req.user._id,
      title: req.body.title || originalname,
      filename,
      filepath,
      filesize,
      status: "processing",
    });

    // Process the document (Extract and Chunk) synchronously let the user wait
    await processDocument(document._id, filepath);

    // Fetch the updated document with chunks and text
    const updatedDocument = await Document.findById(document._id);

    res.status(201).json({
      success: true,
      message: "تم رفع ومعالجة المستند بنجاح",
      data: updatedDocument,
    });
  } catch (error) {
    next(error);
  }
};

const processDocument = async (docId, filePath) => {
  try {
    console.log(`[Background] Starting processing for Document ${docId}...`);

    // 1. Extract Text page-by-page using standard parser
    let { text, numpages, info, pages } = await extractTextFromPDF(filePath);
    console.log(
      `[Background] Standard extraction: ${numpages} pages, ${text?.length || 0} chars.`,
    );

    // 2. Check each page for gibberish (covers handwriting & bad Arabic encoding)
    const isPageGibberish = (pageText) => {
      if (!pageText || pageText.trim().length < 10) return false; // Skip empty pages
      const readableMatch = pageText.match(
        /[a-zA-Z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s\d]/g,
      );
      const readableCount = readableMatch ? readableMatch.length : 0;
      return readableCount / pageText.length < 0.65;
    };

    // 3. If the WHOLE document is garbage, try whole-file AI OCR (scanned PDF)
    const wholeDocIsGarbled =
      pages.length > 0 &&
      pages.filter((p) => isPageGibberish(p)).length > pages.length * 0.6;

    if (wholeDocIsGarbled || pages.length === 0) {
      console.log(
        `[Background] Majority of pages are garbled (${docId}). Using whole-file AI OCR...`,
      );
      try {
        const aiText = await analyzePDFWithAI(filePath);
        if (aiText && aiText.trim().length > 50) {
          text = aiText;
          console.log(
            `[Background] Whole-file AI OCR returned ${text.length} chars.`,
          );
        }
      } catch (aiError) {
        console.error(
          `[Background] Whole-file AI OCR failed:`,
          aiError.message,
        );
      }
    } else if (pages.length > 0) {
      // 4. Only fix individual garbled pages, keep good pages as-is
      const badPageIndexes = pages
        .map((p, i) => (isPageGibberish(p) ? i : -1))
        .filter((i) => i !== -1);

      if (badPageIndexes.length > 0) {
        console.log(
          `[Background] ${badPageIndexes.length}/${pages.length} pages are garbled, fixing individually...`,
        );
        try {
          const badPageTexts = badPageIndexes.map((i) => pages[i]);
          const fixedMap = await fixGarbledPagesWithAI(
            badPageTexts,
            badPageIndexes,
          );

          // Merge fixed pages back in
          fixedMap.forEach((fixedText, pageIdx) => {
            pages[pageIdx] = fixedText;
          });

          // Rebuild full text with corrected pages
          text = pages.map((p, i) => `[Page ${i + 1}]\n${p}`).join("\n\n");
          console.log(
            `[Background] Rebuilt full text with AI fixes: ${text.length} chars.`,
          );
        } catch (aiError) {
          console.error(
            `[Background] Page-level AI fixup failed:`,
            aiError.message,
          );
        }
      } else {
        console.log(`[Background] All pages look good, no AI OCR needed.`);
      }
    }

    // 5. Chunk Text into manageable pieces
    console.log(`[Background] Splitting text into chunks...`);
    const chunks = chunkText(text);
    console.log(
      `[Background] Created ${chunks.length} chunks from ${numpages} pages.`,
    );

    // 6. Update Document
    const updatedDoc = await Document.findByIdAndUpdate(
      docId,
      {
        extractedText: text,
        totalPages: numpages,
        metadata: info,
        chunks,
        status: "ready",
      },
      { new: true },
    );

    if (updatedDoc) {
      console.log(
        `[Background] Document ${docId} is now READY with ${chunks.length} chunks.`,
      );
    } else {
      console.warn(`[Background] Could not find document ${docId} to update!`);
    }
  } catch (error) {
    console.error(`[Background] Error processing document ${docId}:`, error);
    await Document.findByIdAndUpdate(docId, { status: "failed" });
  }
};

// @desc    Get all documents for user
// @route   GET /api/document
// @access  Private
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ user: req.user._id }).sort(
      "-createdAt",
    );
    res.json({
      success: true,
      message: "تم جلب المستندات بنجاح",
      data: documents,
      length: documents.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document
// @route   GET /api/document/:id
// @access  Private
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!document) {
      res.status(404);
      throw new Error("المستند غير موجود");
    }
    // get counts of associated flashcards and quizzes for the current user
    const flashcardsCount = await Flashcard.countDocuments({
      document: document._id,
      user: req.user._id,
    });
    const quizzesCount = await Quize.countDocuments({
      document: document._id,
      user: req.user._id,
    });

    //update last accessed time
    document.lastAccessedAt = Date.now();
    await document.save();
    //compine document data eith counts
    const documentWithCounts = {
      ...document._doc,
      flashcardsCount,
      quizzesCount,
    };

    res.json({
      success: true,
      message: "تم جلب المستند بنجاح",
      data: documentWithCounts,
      flashcardsCount,
      quizzesCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/document/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!document) {
      res.status(404);
      throw new Error("المستند غير موجود");
    }

    // Delete actual file from filesystem
    if (document.filepath) {
      try {
        await fs.unlink(document.filepath);
      } catch (err) {
        console.error("Error deleting file:", err.message);
      }
    }

    res.json({
      success: true,
      message: "تم حذف المستند بنجاح",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
