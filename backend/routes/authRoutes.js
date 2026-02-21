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
import uploadAvatar from "../middleware/profileUploadMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put(
  "/update-me",
  protect,
  uploadAvatar.single("profileImage"),
  updateMe,
);
router.put("/change-password", protect, changePassword);
router.post("/logout", protect, logout);

export default router;
