import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quize from "../models/Quize.js";
import fs from "fs/promises";
import path from "path";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";

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

    // 1. Extract Text using standard parser
    let { text, numpages, info } = await extractTextFromPDF(filePath);
    console.log(
      `[Background] Standard extraction got ${text?.length || 0} characters.`,
    );

    // 2. (AI Fallback skipped as requested)
    if (!text || text.trim().length === 0) {
      console.warn(`[Background] No text extracted from document ${docId}.`);
    }

    // 3. Chunk Text
    console.log(`[Background] Splitting text into chunks...`);
    const chunks = chunkText(text);
    console.log(`[Background] Created ${chunks.length} chunks.`);

    // 4. Update Document
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
      console.log(`[Background] Document ${docId} is now READY.`);
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

    res.json({
      success: true,
      message: "تم جلب المستند بنجاح",
      data: document,
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
