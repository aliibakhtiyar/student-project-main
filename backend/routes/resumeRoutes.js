const express = require("express");
const router = express.Router();

const {
  generateResumeSummary,
  improveResumeProject,
} = require("../controllers/resumeController");

const authMiddleware = require("../middleware/authMiddleware");
const aiRateLimit = require("../middleware/aiRateLimit");
router.post("/ai-summary", authMiddleware, aiRateLimit, generateResumeSummary);
router.post("/ai-project", authMiddleware, aiRateLimit, improveResumeProject);

module.exports = router;