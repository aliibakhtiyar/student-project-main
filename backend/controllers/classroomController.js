const GoogleToken = require("../models/GoogleToken");
const { google } = require("googleapis");
const oauth2Client = require("../config/google");

// ==========================================
// GOOGLE CLASSROOM SCOPES
// ==========================================

const SCOPES = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",

  "https://www.googleapis.com/auth/classroom.coursework.me.readonly",

  "https://www.googleapis.com/auth/classroom.student-submissions.me.readonly",

  "https://www.googleapis.com/auth/classroom.announcements.readonly",
];

// ==========================================
// GET SAVED GOOGLE AUTH
// ==========================================

const getGoogleAuth = async () => {
  try {
    const savedToken = await GoogleToken.findOne();

    if (!savedToken) {
      return null;
    }

    oauth2Client.setCredentials({
      access_token: savedToken.accessToken,
      refresh_token: savedToken.refreshToken,
      expiry_date: savedToken.expiryDate,
      scope: savedToken.scope,
      token_type: savedToken.tokenType,
    });

    return oauth2Client;
  } catch (error) {
    console.error(
      "Get Google Auth Error:",
      error.message
    );

    return null;
  }
};

// ==========================================
// SAVE GOOGLE TOKENS
// ==========================================

const saveGoogleTokens = async (tokens) => {
  try {
    console.log("========== SAVE TOKEN ==========");
    console.log(
      "Access token:",
      !!tokens.access_token
    );

    console.log(
      "Refresh token:",
      !!tokens.refresh_token
    );

    console.log(
      "Expiry:",
      tokens.expiry_date
    );

    console.log(
      "MongoDB state:",
      require("mongoose").connection.readyState
    );

    // Check existing token
    const existingToken =
      await GoogleToken.findOne();

    console.log(
      "Existing token:",
      !!existingToken
    );

    const refreshToken =
      tokens.refresh_token ||
      existingToken?.refreshToken;

    if (!refreshToken) {
      throw new Error(
        "Refresh token is missing"
      );
    }

    const savedToken =
      await GoogleToken.findOneAndUpdate(
        {},
        {
          accessToken:
            tokens.access_token,

          refreshToken:
            refreshToken,

          expiryDate:
            tokens.expiry_date || null,

          scope:
            tokens.scope || "",

          tokenType:
            tokens.token_type || "Bearer",
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

    console.log(
      "TOKEN SAVED SUCCESSFULLY"
    );

    console.log(
      "MongoDB ID:",
      savedToken._id
    );

    console.log(
      "================================"
    );

    return savedToken;

  } catch (error) {
    console.error(
      "SAVE TOKEN ERROR:",
      error.message
    );

    throw error;
  }
};

// ==========================================
// CONNECT GOOGLE CLASSROOM
// ==========================================
const connectClassroom = (req, res) => {
  try {
    const authUrl =
      oauth2Client.generateAuthUrl({
        access_type: "offline",

        scope: SCOPES,

        prompt: "consent",

        include_granted_scopes: true,
      });

    return res.redirect(authUrl);

  } catch (error) {
    console.error(
      "Google Auth Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to connect Google Classroom",
      error: error.message,
    });
  }
};

// ==========================================
// GOOGLE OAUTH CALLBACK
// ==========================================

const classroomCallback = async (
  req,
  res
) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(
        "https://student-project-main.onrender.com?error=no_code"
      );
    }

    // Get Google tokens
    const { tokens } =
      await oauth2Client.getToken(code);

    console.log(
      "Google tokens received"
    );

    // Set credentials
    oauth2Client.setCredentials(tokens);

    // SAVE TO MONGODB
    await saveGoogleTokens(tokens);

    console.log(
      "Google Classroom connected successfully"
    );

    // Redirect frontend
    return res.redirect(
      "https://student-project-main-1.onrender.com/classroom"
    );

  } catch (error) {
    console.error(
      "GOOGLE CALLBACK ERROR:"
    );

    console.error(
      error.response?.data ||
      error.message
    );

    return res.redirect(
      "https://student-project-main.onrender.com?error=google_auth_failed"
    );
  }
};

// ==========================================
// CHECK CONNECTION
// ==========================================

const checkClassroomConnection =
  async (req, res) => {
    try {
      const savedToken =
        await GoogleToken.findOne();

      if (!savedToken) {
        return res.status(200).json({
          success: true,

          connected: false,
        });
      }

      return res.status(200).json({
        success: true,

        connected: true,
      });
    } catch (error) {
      console.error(
        "Check Classroom Connection Error:",
        error.message
      );

      return res.status(500).json({
        success: false,

        connected: false,

        message:
          "Unable to check Classroom connection",
      });
    }
  };

// ==========================================
// GET COURSES
// ==========================================

const getCourses = async (
  req,
  res
) => {
  try {
    // ======================================
    // Load saved Google authentication
    // ======================================

    const auth =
      await getGoogleAuth();

    if (!auth) {
      return res.status(401).json({
        success: false,

        message:
          "Google Classroom is not connected",
      });
    }

    // ======================================
    // Classroom API
    // ======================================

    const classroom = google.classroom({
      version: "v1",

      auth,
    });

    // ======================================
    // Get active courses
    // ======================================

    const response =
      await classroom.courses.list({
        courseStates: ["ACTIVE"],

        pageSize: 100,
      });

    const courses =
      response.data.courses || [];

    console.log(
      "Active courses:",
      courses.length
    );

    // ======================================
    // Response
    // ======================================

    return res.status(200).json({
      success: true,

      count: courses.length,

      courses,
    });
  } catch (error) {
    console.error(
      "--------------------------------"
    );

    console.error(
      "Get Courses Error"
    );

    console.error(
      error.response?.data ||
        error.message
    );

    console.error(
      "--------------------------------"
    );

    return res.status(
      error.response?.status || 500
    ).json({
      success: false,

      message:
        "Unable to fetch courses",

      error:
        error.response?.data ||
        error.message,
    });
  }
};

// ==========================================
// GET UPCOMING ASSIGNMENTS
// ==========================================

const getAssignments = async (
  req,
  res
) => {
  try {
    // ======================================
    // Load saved Google authentication
    // ======================================

    const auth =
      await getGoogleAuth();

    if (!auth) {
      return res.status(401).json({
        success: false,

        message:
          "Google Classroom is not connected",
      });
    }

    // ======================================
    // Classroom API
    // ======================================

    const classroom = google.classroom({
      version: "v1",

      auth,
    });

    // ======================================
    // Get active courses
    // ======================================

    const coursesResponse =
      await classroom.courses.list({
        courseStates: ["ACTIVE"],

        pageSize: 100,
      });

    const courses =
      coursesResponse.data.courses || [];

    console.log(
      "Active courses:",
      courses.length
    );

    // ======================================
    // Store assignments
    // ======================================

    const assignments = [];

    // ======================================
    // Loop through courses
    // ======================================

    for (const course of courses) {
      try {
        // ==================================
        // Get coursework
        // ==================================

        const courseworkResponse =
          await classroom.courses.courseWork.list(
            {
              courseId: course.id,

              courseWorkStates: [
                "PUBLISHED",
              ],

              pageSize: 100,

              orderBy:
                "updateTime desc",
            }
          );

        const coursework =
          courseworkResponse.data
            .courseWork || [];

        // ==================================
        // Loop coursework
        // ==================================

        for (const work of coursework) {
          let submission = null;

          // =================================
          // Get student's submission
          // =================================

          try {
            const submissionResponse =
              await classroom.courses.courseWork.studentSubmissions.list(
                {
                  courseId: course.id,

                  courseWorkId: work.id,

                  userId: "me",

                  pageSize: 1,
                }
              );

            submission =
              submissionResponse.data
                .studentSubmissions?.[0] ||
              null;
          } catch (submissionError) {
            console.error(
              `Submission error for ${work.title}:`,
              submissionError.message
            );
          }

          // =================================
          // Format due date
          // =================================

          let dueDate = null;

          if (work.dueDate) {
            const year =
              work.dueDate.year;

            const month = String(
              work.dueDate.month
            ).padStart(2, "0");

            const day = String(
              work.dueDate.day
            ).padStart(2, "0");

            dueDate =
              `${year}-${month}-${day}`;

            // Add time
            if (work.dueTime) {
              const hours = String(
                work.dueTime.hours || 0
              ).padStart(2, "0");

              const minutes = String(
                work.dueTime.minutes || 0
              ).padStart(2, "0");

              const seconds = String(
                work.dueTime.seconds || 0
              ).padStart(2, "0");

              dueDate +=
                `T${hours}:${minutes}:${seconds}`;
            }
          }

          // =================================
          // Add assignment
          // =================================

          assignments.push({
            id: work.id,

            title:
              work.title ||
              "Untitled Assignment",

            description:
              work.description || "",

            courseId:
              course.id,

            courseName:
              course.name ||
              "Unknown Course",

            section:
              course.section || "",

            workType:
              work.workType ||
              "ASSIGNMENT",

            state:
              work.state ||
              "PUBLISHED",

            dueDate,

            maxPoints:
              work.maxPoints ?? null,

            status:
              submission?.state ||
              "NEW",

            assignedGrade:
              submission?.assignedGrade ??
              null,

            draftGrade:
              submission?.draftGrade ??
              null,

            alternateLink:
              work.alternateLink ||
              null,

            creationTime:
              work.creationTime ||
              null,

            updateTime:
              work.updateTime ||
              null,
          });
        }
      } catch (courseError) {
        console.error(
          `Error getting coursework for ${course.name}:`,
          courseError.message
        );
      }
    }

    // ======================================
    // Sort by due date
    // ======================================

    assignments.sort((a, b) => {
      if (!a.dueDate) return 1;

      if (!b.dueDate) return -1;

      return (
        new Date(a.dueDate) -
        new Date(b.dueDate)
      );
    });

    // ======================================
    // Get upcoming assignments
    // ======================================

    const now = new Date();

    const upcomingAssignments =
      assignments.filter(
        (assignment) => {
          if (!assignment.dueDate) {
            return false;
          }

          return (
            new Date(
              assignment.dueDate
            ) >= now
          );
        }
      );

    console.log(
      "Total assignments:",
      assignments.length
    );

    console.log(
      "Upcoming assignments:",
      upcomingAssignments.length
    );

    // ======================================
    // Response
    // ======================================

    return res.status(200).json({
      success: true,

      count:
        upcomingAssignments.length,

      assignments:
        upcomingAssignments,
    });
  } catch (error) {
    console.error(
      "--------------------------------"
    );

    console.error(
      "Get Assignments Error"
    );

    console.error(
      error.response?.data ||
        error.message
    );

    console.error(
      "--------------------------------"
    );

    return res.status(
      error.response?.status || 500
    ).json({
      success: false,

      message:
        "Unable to fetch Google Classroom assignments",

      error:
        error.response?.data ||
        error.message,
    });
  }
};

// ==========================================
// DISCONNECT GOOGLE CLASSROOM
// ==========================================

const disconnectClassroom =
  async (req, res) => {
    try {
      const savedToken =
        await GoogleToken.findOne();

      if (savedToken) {
        try {
          await oauth2Client.revokeToken(
            savedToken.refreshToken
          );
        } catch (revokeError) {
          console.error(
            "Google revoke error:",
            revokeError.message
          );
        }
      }

      await GoogleToken.deleteMany({});

      oauth2Client.revokeCredentials();

      console.log(
        "Google Classroom disconnected"
      );

      return res.status(200).json({
        success: true,

        message:
          "Google Classroom disconnected",
      });
    } catch (error) {
      console.error(
        "Disconnect Classroom Error:",
        error.message
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to disconnect Google Classroom",

        error: error.message,
      });
    }
  };

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  connectClassroom,

  classroomCallback,

  checkClassroomConnection,

  getCourses,

  getAssignments,

  disconnectClassroom,
};