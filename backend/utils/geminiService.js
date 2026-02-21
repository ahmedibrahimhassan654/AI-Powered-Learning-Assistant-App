import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// We'll initialize lazily to ensure process.env is loaded
let genAI = null;

const getGenAI = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      console.error("CRITICAL: GEMINI_API_KEY is not configured in .env");
      throw new Error("يرجى إعداد GEMINI_API_KEY في ملف .env");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

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
    const aiClient = getGenAI();
    const model = aiClient.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt =
      "Please extract the full text content from this document. If the content is in Arabic, please preserve and provide the exact Arabic text. Do not summarize; provide all text found on the pages.";

    const filePart = fileToGenerativePart(filePath, "application/pdf");

    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini AI Analysis Error:", error);
    throw new Error("فشل في تحليل الملف باستخدام الذكاء الاصطناعي");
  }
};

/**
 * Generate a chat response using RAG (Context + History)
 * @param {string} userQuery - The user's question
 * @param {string} context - Relevant document chunks
 * @param {Array} history - Previous chat messages
 * @returns {Promise<string>}
 */
export const generateChatResponse = async (
  userQuery,
  context,
  history = [],
) => {
  try {
    const aiClient = getGenAI();
    const model = aiClient.getGenerativeModel({ model: "gemini-flash-latest" });

    // Start a chat session with history if available
    // Format history for Gemini SDK
    const formattedHistory = history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const systemPrompt = `You are a helpful learning assistant. Answer the user's question based ONLY on the provided context from their document. 
If the answer is not in the context, politely say that the information is not in the document. 
If the user asks in Arabic, answer in Arabic.

CONTEXT:
${context}

USER QUESTION:
${userQuery}`;

    const result = await chat.sendMessage(systemPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw new Error("فشل في الحصول على رد من الذكاء الاصطناعي");
  }
};
