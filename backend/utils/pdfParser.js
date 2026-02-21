import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

/**
 * Extracts text from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<object>} - The extracted data (text, numpages, info)
 */
export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = await fs.promises.readFile(filePath);

    // Call pdf-parse function
    const data = await pdf(dataBuffer);

    return {
      text: data.text || "",
      numpages: data.numpages || 0,
      info: data.info || {},
    };
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("فشل في استخراج النص من ملف PDF");
  }
};
