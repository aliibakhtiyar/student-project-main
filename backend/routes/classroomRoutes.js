const express = require("express");

const {
  connectClassroom,
  classroomCallback,
  checkClassroomConnection,
  getCourses,
  getAssignments,
  disconnectClassroom,
} = require("../controllers/classroomController");

const router = express.Router();

router.get("/connect", connectClassroom);

router.get("/callback", classroomCallback);

router.get("/status", checkClassroomConnection);

router.get("/courses", getCourses);

router.get("/assignments", getAssignments);

router.delete("/disconnect", disconnectClassroom);

module.exports = router;