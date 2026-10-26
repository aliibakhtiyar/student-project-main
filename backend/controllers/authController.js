const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const institutes = require("../data/Institutes.js");

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ===============================
// REGISTER
// ===============================

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      institute,
      department,
      year,
      semester,
    } = req.body;

    // -----------------------------
    // 1. Normalize input
    // -----------------------------

    const normalizedEmail = email.toLowerCase().trim();

    // -----------------------------
    // 2. Check institute
    // -----------------------------

    const selectedInstitute = institutes.find(
      (item) => item.id === institute
    );

    if (!selectedInstitute) {
      return res.status(400).json({
        success: false,
        message: "Invalid institute selected",
      });
    }

    // -----------------------------
    // 3. Extract email domain
    // -----------------------------

    const emailParts = normalizedEmail.split("@");

    if (emailParts.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    const emailDomain = emailParts[1];

    // -----------------------------
    // 4. Check college email domain
    // -----------------------------

    const isValidDomain = selectedInstitute.domains.some(
      (domain) =>
        domain.toLowerCase() === emailDomain
    );

    if (!isValidDomain) {
      return res.status(400).json({
        success: false,
        message: `Please use your official ${selectedInstitute.name} email`,
      });
    }

    // -----------------------------
    // 5. Check existing user
    // -----------------------------

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // -----------------------------
    // 6. Hash password
    // -----------------------------

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    // -----------------------------
    // 7. Generate OTP
    // -----------------------------

    const otp = generateOTP();

    // OTP valid for 10 minutes

    const otpExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // -----------------------------
    // 8. Create user
    // -----------------------------

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,

      institute: selectedInstitute.id,

      department,
      year,
      semester,

      isEmailVerified: false,

      isStudentVerified: false,

      verificationMethod: "college_email",

      otp,
      otpExpiresAt,

      otpAttempts: 0,
    });

    // -----------------------------
    // 9. Development OTP
    // -----------------------------

    console.log("--------------------------------");
    console.log("Student:", normalizedEmail);
    console.log("OTP:", otp);
    console.log("--------------------------------");

    // -----------------------------
    // 10. Response
    // -----------------------------

    return res.status(201).json({
      success: true,

      message:
        "Registration successful. OTP generated.",

      userId: user._id,

      // Development only
      otp: process.env.NODE_ENV === "development"
        ? otp
        : undefined,
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===============================
// VERIFY OTP
// ===============================

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // -----------------------------
    // 1. Normalize email
    // -----------------------------

    const normalizedEmail = email.toLowerCase().trim();

    // -----------------------------
    // 2. Find user
    // -----------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    }).select(
      "+otp +otpExpiresAt +otpAttempts"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -----------------------------
    // 3. Already verified?
    // -----------------------------

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // -----------------------------
    // 4. OTP attempts
    // -----------------------------

    if (user.otpAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    // -----------------------------
    // 5. Check OTP expiry
    // -----------------------------

    if (
      !user.otpExpiresAt ||
      user.otpExpiresAt < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP.",
      });
    }

    // -----------------------------
    // 6. Compare OTP
    // -----------------------------

    if (user.otp !== otp) {
      user.otpAttempts += 1;

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // -----------------------------
    // 7. Successful verification
    // -----------------------------

    user.isEmailVerified = true;

    user.isStudentVerified = true;

    user.verificationMethod = "college_email";

    user.otp = undefined;

    user.otpExpiresAt = undefined;

    user.otpAttempts = 0;

    await user.save();

    // -----------------------------
    // 8. Generate JWT
    // -----------------------------

    const token = generateToken(user._id);

    // -----------------------------
    // 9. Response
    // -----------------------------

    return res.status(200).json({
      success: true,

      message: "Student verified successfully",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        institute: user.institute,
        isEmailVerified: user.isEmailVerified,
        isStudentVerified: user.isStudentVerified,
        verificationMethod:
          user.verificationMethod,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===============================
// LOGIN
// ===============================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Find user including password
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Email verification check
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your college email first",
      });
    }

    // Password check
    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        institute: user.institute,
        isEmailVerified: user.isEmailVerified,
        isStudentVerified:
          user.isStudentVerified,
        verificationMethod:
          user.verificationMethod,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===============================
// GET CURRENT USER
// ===============================

const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("Get Me Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      department,
      year,
      semester,
      github,
      linkedin,
    } = req.body;

    // Basic validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    // Find logged-in user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update allowed fields only
    user.name = name.trim();
    user.department = department?.trim() || "";
    user.github = github?.trim() || "";
    user.linkedin = linkedin?.trim() || "";

    if (year !== undefined && year !== "") {
      user.year = Number(year);
    }

    if (semester !== undefined && semester !== "") {
      user.semester = Number(semester);
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        institute: updatedUser.institute,
        department: updatedUser.department,
        year: updatedUser.year,
        semester: updatedUser.semester,
        github: updatedUser.github,
        linkedin: updatedUser.linkedin,
        isEmailVerified: updatedUser.isEmailVerified,
        isStudentVerified: updatedUser.isStudentVerified,
        verificationMethod: updatedUser.verificationMethod,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
};


module.exports = {
  register,
  verifyOTP,
  login,
  getMe,
  updateProfile,
};