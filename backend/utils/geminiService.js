import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import fs from "fs";

// ─── Gemini (for PDF OCR only) ───────────────────────────────────────────────
let genAI = null;
const getGenAI = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      throw new Error("يرجى إعداد GEMINI_API_KEY في ملف .env");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

// ─── OpenRouter / DeepSeek (for chat) ────────────────────────────────────────
// Get a FREE key at: https://openrouter.ai
// Free models available: deepseek/deepseek-r1:free, meta-llama/llama-3.1-8b-instruct:free
let openRouterClient = null;
const getOpenRouter = () => {
  if (!openRouterClient) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === "your_openrouter_api_key_here") {
      throw new Error(
        "يرجى إعداد OPENROUTER_API_KEY في ملف .env — احصل على مفتاح مجاني من https://openrouter.ai",
      );
    }
    openRouterClient = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:5173", // Required by OpenRouter
        "X-Title": "AI Learning Assistant",
      },
    });
  }
  return openRouterClient;
};

// The free model on OpenRouter — change here to switch models
// Working free models (Feb 2026):
//   "meta-llama/llama-3.3-70b-instruct:free"
//   "deepseek/deepseek-chat-v3-0324:free"
//   "mistralai/mistral-7b-instruct:free"
//   "google/gemma-3-27b-it:free"
const CHAT_MODEL = "meta-llama/llama-3.3-70b-instruct:free";

// ─── Gemini model for OCR ─────────────────────────────────────────────────────
const GEMINI_MODEL = "gemini-2.0-flash-lite";

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Analyze a PDF using Gemini vision OCR (Arabic-capable).
 * Used for scanned/handwritten PDFs.
 * @param {string} filePath
 * @returns {Promise<string>}
 */
export const analyzePDFWithAI = async (filePath) => {
  try {
    const ai = getGenAI();
    const fileData = fs.readFileSync(filePath);
    const base64Data = fileData.toString("base64");

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          parts: [
            {
              text: "Please extract the full text content from this document. If the content is in Arabic, preserve the exact Arabic text. Do not summarize; provide all text found on the pages.",
            },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Data,
              },
            },
          ],
        },
      ],
    });

    return response.text;
  } catch (error) {
    console.error("Gemini OCR Error:", error.message);
    throw new Error("فشل في تحليل الملف باستخدام الذكاء الاصطناعي");
  }
};

/**
 * Fix garbled pages using Gemini OCR — sends batches of 10 pages.
 * @param {string[]} badPages
 * @param {number[]} pageIndexes
 * @returns {Promise<Map<number, string>>}
 */
export const fixGarbledPagesWithAI = async (badPages, pageIndexes) => {
  const ai = getGenAI();
  const results = new Map();
  const BATCH_SIZE = 10;

  for (let i = 0; i < badPages.length; i += BATCH_SIZE) {
    const batchPages = badPages.slice(i, i + BATCH_SIZE);
    const batchIndexes = pageIndexes.slice(i, i + BATCH_SIZE);

    const prompt = `The following are extracted text fragments from a PDF. Some may be garbled Arabic.
Clean up and return correct Arabic for each page.
Format: PAGE_N: <clean text>

${batchPages.map((p, j) => `PAGE_${batchIndexes[j] + 1}: ${p}`).join("\n\n")}`;

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ parts: [{ text: prompt }] }],
      });

      response.text.split("\n").forEach((line) => {
        const match = line.match(/^PAGE_(\d+):\s*(.*)/);
        if (match) {
          const pageNum = parseInt(match[1], 10) - 1;
          if (batchIndexes.includes(pageNum)) {
            results.set(pageNum, match[2].trim());
          }
        }
      });

      if (i + BATCH_SIZE < badPages.length) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error(
        `[Gemini] Batch OCR failed pages ${i}-${i + BATCH_SIZE}:`,
        err.message,
      );
    }
  }

  return results;
};

/**
 * Generate a chat response using DeepSeek via OpenRouter (FREE).
 * Uses RAG: injects document context + conversation history into the prompt.
 * @param {string} userQuery
 * @param {string} context - Relevant document chunks
 * @param {Array} history - [{role, content}]
 * @returns {Promise<string>}
 */
export const generateChatResponse = async (
  userQuery,
  context,
  history = [],
) => {
  try {
    const client = getOpenRouter();

    // Build the messages array for the chat API
    const messages = [
      {
        role: "system",
        content: `أنت مساعد تعليمي ذكي متخصص. مهمتك الإجابة على أسئلة الطلاب بناءً على المستند فقط.

قواعد مهمة:
- أجب باللغة التي استخدمها المستخدم (عربي أو إنجليزي).
- إذا لم تجد الإجابة في السياق، أخبر المستخدم بذلك بلطف.
- لا تخترع معلومات غير موجودة في المستند.
- كن مفصلاً ومنظماً في إجابتك.

=== محتوى المستند (السياق) ===
${context || "لا يوجد سياق متاح"}`,
      },
      // Inject the last N chat messages as conversation history
      ...history.slice(-8).map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      // Current user question
      { role: "user", content: userQuery },
    ];

    const completion = await client.chat.completions.create({
      model: CHAT_MODEL,
      messages,
      max_tokens: 1500,
      temperature: 0.3, // Lower = more factual, less creative
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("DeepSeek/OpenRouter Chat Error:", {
      message: error.message,
      status: error.status,
      code: error.code,
    });
    throw new Error(
      `فشل في الحصول على رد من الذكاء الاصطناعي: ${error.message}`,
    );
  }
};
