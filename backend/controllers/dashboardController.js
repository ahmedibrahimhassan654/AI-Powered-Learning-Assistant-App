import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quize from "../models/Quize.js";

// @desc    Get dashboard stats and recent activity
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch counts
    const totalDocuments = await Document.countDocuments({ user: userId });
    const totalFlashcards = await Flashcard.countDocuments({ user: userId });
    const totalQuizzes = await Quize.countDocuments({ user: userId });

    // Fetch recent documents
    const recentDocuments = await Document.find({ user: userId })
      .sort("-createdAt")
      .limit(5)
      .select("title createdAt status filesize");

    res.json({
      success: true,
      data: {
        stats: {
          totalDocuments,
          totalFlashcards,
          totalQuizzes,
        },
        recentDocuments,
      },
    });
  } catch (error) {
    next(error);
  }
};
