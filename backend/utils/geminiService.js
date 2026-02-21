import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

if (
  !process.env.GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY === "your_gemini_api_key_here"
) {
  console.warn("WARNING: GEMINI_API_KEY is not configured in .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Helper to convert file data to GoogleGenerativeAI.Part object
 * @param {string} path
 * @param {string} mimeType
 * @returns
 */
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

/**
 * Analyze a PDF using Gemini 1.5 Flash (supports OCR and Arabic)
 * @param {string} filePath
 * @returns {Promise<string>}
 */
export const analyzePDFWithAI = async (filePath) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt =
      "Please extract and summarize the text from this PDF. If the content is in Arabic, please preserve the Arabic text exactly. Provide the full text content found in the document.";

    const filePart = fileToGenerativePart(filePath, "application/pdf");

    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini AI Analysis Error:", error);
    throw new Error("فشل في تحليل الملف باستخدام الذكاء الاصطناعي");
  }
};
