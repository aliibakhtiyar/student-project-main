const express = require("express");
const router = express.Router();

const {
  generateResumeSummary,
  improveResumeProject,
} = require("../controllers/resumeController");

router.post("/ai-summary", generateResumeSummary);
router.post("/ai-project", improveResumeProject);

module.exports = router;