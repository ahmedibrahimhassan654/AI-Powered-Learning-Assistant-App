import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  changePassword,
  logout,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/update-me", protect, updateMe);
router.put("/change-password", protect, changePassword);
router.post("/logout", protect, logout);

export default router;
