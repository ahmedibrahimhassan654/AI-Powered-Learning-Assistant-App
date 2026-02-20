import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },
    cards: [
      {
        question: {
          type: String,
          required: [true, "يرجى إضافة السؤال"],
        },
        answer: {
          type: String,
          required: [true, "يرجى إضافة الإجابة"],
        },
        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "medium",
        },
        lastReviewed: {
          type: Date,
        },
        reviewCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    isStarted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index for better query performance
flashcardSchema.index({ user: 1, document: 1 });

const Flashcard = mongoose.model("Flashcard", flashcardSchema);

export default Flashcard;
