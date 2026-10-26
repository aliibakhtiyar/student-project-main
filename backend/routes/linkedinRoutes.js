const express = require("express");

const {
  connectLinkedIn,
  linkedInCallback,
  getLinkedInProfile,
  getLinkedInStatus,
  disconnectLinkedIn,
} = require("../controllers/linkedinController");

const router = express.Router();


// Start LinkedIn OAuth
router.get(
  "/connect",
  connectLinkedIn
);


// LinkedIn callback
router.get(
  "/callback",
  linkedInCallback
);


// Get profile
router.get(
  "/profile",
  getLinkedInProfile
);


// Check connection
router.get(
  "/status",
  getLinkedInStatus
);


// Disconnect
router.post(
  "/disconnect",
  disconnectLinkedIn
);


module.exports = router;