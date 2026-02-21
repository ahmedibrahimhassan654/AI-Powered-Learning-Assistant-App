import Document from "../models/Document.js";
import ChatHistory from "../models/ChatHistory.js";
import { findRelevantChunks } from "../utils/textChunker.js";
import { generateChatResponse } from "../utils/geminiService.js";

// @desc    Ask a question about a document
// @route   POST /api/ai/chat/:docId
// @access  Private
export const askQuestion = async (req, res, next) => {
  try {
    const { message } = req.body;
    const { docId } = req.params;

    if (!message) {
      res.status(400);
      throw new Error("يرجى كتابة رسالة");
    }

    // 1. Get the document
    const document = await Document.findOne({
      _id: docId,
      user: req.user._id,
    }).lean();
    if (!document) {
      res.status(404);
      throw new Error("المستند غير موجود");
    }

    // 2. Find relevant context from chunks
    const relevantChunks = findRelevantChunks(document.chunks, message, 5);
    const context = relevantChunks
      .map((c) => c.content || "")
      .join("\n\n---\n\n");

    // 3. Get or Create Chat History
    let historyRecord = await ChatHistory.findOne({
      user: req.user._id,
      document: docId,
    });

    if (!historyRecord) {
      historyRecord = await ChatHistory.create({
        user: req.user._id,
        document: docId,
        messages: [],
      });
    }

    // 4. Generate AI Response using Gemini
    // We pass the last few messages for context
    const recentMessages = historyRecord.messages.slice(-6);
    const aiResponse = await generateChatResponse(
      message,
      context,
      recentMessages,
    );

    // 5. Update History
    historyRecord.messages.push({
      role: "user",
      content: message,
      relevantChunks: relevantChunks.map(
        (c) => (c.content || "").substring(0, 100) + "...",
      ),
    });

    historyRecord.messages.push({
      role: "assistant",
      content: aiResponse,
    });

    await historyRecord.save();

    res.json({
      success: true,
      data: {
        answer: aiResponse,
        history: historyRecord.messages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat history for a document
// @route   GET /api/ai/history/:docId
// @access  Private
export const getChatHistory = async (req, res, next) => {
  try {
    const { docId } = req.params;

    const history = await ChatHistory.findOne({
      user: req.user._id,
      document: docId,
    });

    res.json({
      success: true,
      data: history ? history.messages : [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear chat history for a document
// @route   DELETE /api/ai/history/:docId
// @access  Private
export const clearChatHistory = async (req, res, next) => {
  try {
    const { docId } = req.params;

    await ChatHistory.findOneAndDelete({
      user: req.user._id,
      document: docId,
    });

    res.json({
      success: true,
      message: "تم مسح سجل المحادثة بنجاح",
    });
  } catch (error) {
    next(error);
  }
};
