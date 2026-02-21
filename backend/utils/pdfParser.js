import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

/**
 * Extracts text from a PDF file, page by page.
 * Returns the full concatenated text and per-page texts for targeted OCR.
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<object>} - { text, numpages, info, pages }
 */
export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = await fs.promises.readFile(filePath);

    // Collect per-page texts using the render_page callback
    const pages = [];

    const options = {
      pagerender: function (pageData) {
        return pageData.getTextContent().then((textContent) => {
          const pageText = textContent.items.map((item) => item.str).join(" ");
          pages.push(pageText);
          return pageText;
        });
      },
    };

    const data = await pdf(dataBuffer, options);

    // If per-page collection worked, use it; otherwise fallback to full text
    const fullText =
      pages.length > 0
        ? pages.map((p, i) => `[Page ${i + 1}]\n${p}`).join("\n\n")
        : data.text || "";

    return {
      text: fullText,
      numpages: data.numpages || pages.length || 0,
      info: data.info || {},
      pages, // individual page texts for targeted OCR
    };
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("فشل في استخراج النص من ملف PDF");
  }
};
