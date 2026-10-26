const express = require("express");

const {
  getLeetCodeProfile,
} = require("../controllers/leetcodeController");

const router = express.Router();

router.get(
  "/profile/:username",
  getLeetCodeProfile
);

module.exports = router;