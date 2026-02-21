import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import Document from "./models/Document.js";
import { extractTextFromPDF } from "./utils/pdfParser.js";
import {
  fixGarbledPagesWithAI,
  analyzePDFWithAI,
} from "./utils/geminiService.js";
import { chunkText } from "./utils/textChunker.js";

// Pass docId as argument: node reprocessDoc.js <docId>
const docId = process.argv[2];

const run = async () => {
  await connectDB();

  if (!docId) {
    console.error("Usage: node reprocessDoc.js <docId>");
    process.exit(1);
  }

  console.log("Loading doc:", docId);
  const doc = await Document.findById(docId);
  if (!doc) {
    console.error("Document not found!");
    process.exit(1);
  }

  console.log(`Found: "${doc.title}" | path: ${doc.filepath}`);

  try {
    console.log("Extracting text page-by-page...");
    let { text, numpages, info, pages } = await extractTextFromPDF(
      doc.filepath,
    );
    console.log(`Extracted ${numpages} pages, ${text.length} chars total.`);

    // Check which pages are garbled
    const isPageGibberish = (pageText) => {
      if (!pageText || pageText.trim().length < 10) return false;
      const readableMatch = pageText.match(
        /[a-zA-Z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s\d]/g,
      );
      const readableCount = readableMatch ? readableMatch.length : 0;
      return readableCount / pageText.length < 0.65;
    };

    const badPageIndexes = pages
      .map((p, i) => (isPageGibberish(p) ? i : -1))
      .filter((i) => i !== -1);

    console.log(`Garbled pages: ${badPageIndexes.length}/${pages.length}`);

    const wholeDocIsGarbled =
      pages.length > 0 && badPageIndexes.length > pages.length * 0.6;

    if (wholeDocIsGarbled || pages.length === 0) {
      console.log("Majority garbled — using whole-file AI OCR...");
      const aiText = await analyzePDFWithAI(doc.filepath);
      if (aiText && aiText.trim().length > 50) {
        text = aiText;
        console.log(`Whole-file AI OCR: ${text.length} chars.`);
      }
    } else if (badPageIndexes.length > 0) {
      console.log(
        `Fixing ${badPageIndexes.length} garbled pages in batches...`,
      );
      const badPageTexts = badPageIndexes.map((i) => pages[i]);
      const fixedMap = await fixGarbledPagesWithAI(
        badPageTexts,
        badPageIndexes,
      );

      fixedMap.forEach((fixedText, pageIdx) => {
        pages[pageIdx] = fixedText;
      });

      text = pages.map((p, i) => `[Page ${i + 1}]\n${p}`).join("\n\n");
      console.log(`Rebuilt full text: ${text.length} chars.`);
    } else {
      console.log("All pages are good, rebuilding full text...");
      text = pages.map((p, i) => `[Page ${i + 1}]\n${p}`).join("\n\n");
    }

    console.log("Chunking text...");
    const chunks = chunkText(text);
    console.log(`Created ${chunks.length} chunks.`);

    doc.extractedText = text;
    doc.chunks = chunks;
    doc.totalPages = numpages;
    doc.status = "ready";
    await doc.save();

    console.log(
      `✅ Successfully reprocessed! Doc now has ${chunks.length} chunks from ${numpages} pages.`,
    );
  } catch (e) {
    console.error("Error during reprocessing:", e);
  }

  process.exit(0);
};

run();
