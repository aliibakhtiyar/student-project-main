
const express = require("express");
const router = express.Router();

const {
  generateQuiz,
  submitQuiz,
  getQuizHistory,
} = require("../controllers/quizController");

const authMiddleware = require("../middleware/authMiddleware");

// Replace the middleware import with the authentication
// middleware already used in your project.

router.post("/generate", authMiddleware, generateQuiz);
router.post("/submit", authMiddleware, submitQuiz);
router.get("/history", authMiddleware, getQuizHistory);

module.exports = router;
