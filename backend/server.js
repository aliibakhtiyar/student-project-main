const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");
require("dotenv").config();
const classroomRoutes = require("./routes/classroomRoutes");


const express = require("express");
const leetcodeRoutes =
  require("./routes/leetcodeRoutes");
const linkedinRoutes =
  require("./routes/linkedinRoutes");
const cors = require("cors");
const githubRoutes = require("./routes/githubRoutes");
const aiRoutes = require("./routes/aiRoutes");
const connectDB = require("./db");

const authRoutes = require("./routes/authRoutes");
const opportunityRoutes = require(
  "./routes/opportunityRoutes"
);

const app = express();

// ===============================
// Database
// ===============================

connectDB();
app.use(
  express.json({
    limit: "10kb",
  })
);

// ===============================
// Middleware
// ===============================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(
  "/api/classroom",
  classroomRoutes
);
app.use(
  "/api/leetcode",
  leetcodeRoutes
);
app.use(
  "/api/ai",
  aiRoutes
);
app.use("/api/github", githubRoutes);
app.use(
  "/api/linkedin",
  linkedinRoutes
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);
app.use(
  "/api/opportunities",
  opportunityRoutes
);

// ===============================
// Health Check
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Student Platform API is running 🚀",
  });
});

// ===============================
// Routes
// ===============================

app.use(
  "/api/auth",
  authRoutes
);

// ===============================
// 404
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ===============================
// Global Error Handler
// ===============================

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ===============================
// Server
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});