import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

connectDB();

app.use(
  cors({
    origin: "*",
    methods: ["GET,HEAD,PUT,PATCH,POST,DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type,Authorization"],
  }),
);
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

//static folder for uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//routes
app.use("/api/auth", authRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/ai", aiRoutes);
// app.use("/api/flashcard", require("./routes/flashcardRoutes"));
// app.use("/api/quize", require("./routes/quizeRoutes"));

//error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
