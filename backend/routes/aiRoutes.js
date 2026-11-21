const express = require("express");

const router = express.Router();

const {
  chatWithAI,
} = require("../controllers/aiController");

const authMiddleware = require("../middleware/authMiddleware");
const aiRateLimit = require("../middleware/aiRateLimit");
router.post("/chat", authMiddleware, aiRateLimit, chatWithAI);

module.exports = router;