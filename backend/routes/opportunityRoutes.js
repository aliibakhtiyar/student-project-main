const express = require("express");

const {
  getHackathons,
    getJobs,
  getInternships,
  getBenefits,
  getEvents
} = require("../controllers/opportunityController");

const router = express.Router();

router.get(
  "/hackathons",
  getHackathons
);

router.get(
  "/jobs",
  getJobs
);

router.get(
  "/internships",
  getInternships
);
router.get(
  "/events",
  getEvents
);
router.get("/student-offers", getBenefits);
module.exports = router;