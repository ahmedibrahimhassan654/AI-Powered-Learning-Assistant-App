import express from "express";
import {
  askQuestion,
  getChatHistory,
  clearChatHistory,
} from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // All AI routes are protected

router.post("/chat/:docId", askQuestion);
router.get("/history/:docId", getChatHistory);
router.delete("/history/:docId", clearChatHistory);

export default router;
