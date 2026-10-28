
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const institutes = require("../data/Institutes.js");
const transporter = require("../config/mailer");

// Generate a 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// Generate JWT
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ===============================
// REGISTER + SEND EMAIL OTP
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

    if (!name || !email || !password || !institute) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and institute are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedName = name.trim();

    // Find selected institute
    const selectedInstitute = institutes.find(
      (item) => item.id === institute
    );

    if (!selectedInstitute) {
      return res.status(400).json({
        success: false,
        message: "Invalid institute selected",
      });
    }

    // Validate college email domain
    const emailParts = normalizedEmail.split("@");

    if (emailParts.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    const emailDomain = emailParts[1];

    const isValidDomain = selectedInstitute.domains.some(
      (domain) => domain.toLowerCase() === emailDomain
    );

    if (!isValidDomain) {
      return res.status(400).json({
        success: false,
        message: `Please use your official ${selectedInstitute.name} email`,
      });
    }

    // Check existing account
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.isEmailVerified
          ? "Email already registered. Please login."
          : "An account already exists for this email. Use the resend OTP flow or remove the test account before registering again.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Create unverified user
    const user = await User.create({
      name: normalizedName,
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

    // Send OTP email
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        throw new Error("SMTP_USER or SMTP_PASSWORD is missing in .env");
      }

      await transporter.sendMail({
        from: {
          name: "UniSphere",
          address: process.env.SMTP_FROM || process.env.SMTP_USER,
        },
        to: normalizedEmail,
        subject: "UniSphere - Email Verification OTP",
        text: `Hello ${normalizedName},

Your UniSphere verification OTP is ${otp}.

This OTP expires in 10 minutes.

If you did not request this, please ignore this email.`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #ddd;border-radius:12px">
            <h2 style="color:#4f46e5">Welcome to UniSphere!</h2>
            <p>Hello ${normalizedName.replace(/[&<>"']/g, "")},</p>
            <p>Use this OTP to verify your college email:</p>
            <h1 style="letter-spacing:8px;color:#4f46e5">${otp}</h1>
            <p>This OTP expires in <strong>10 minutes</strong>.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("OTP email sending failed:", emailError);

      // Remove the unverified account so registration can be retried
      await User.deleteOne({ _id: user._id }).catch((deleteError) => {
        console.error("Failed to clean up unverified user:", deleteError);
      });

      return res.status(502).json({
        success: false,
        message: "Could not send OTP email. Check SMTP settings and backend logs, then try again.",
      });
    }

    console.log(`OTP email sent to ${normalizedEmail}`);

    return res.status(201).json({
      success: true,
      message: "Registration successful. OTP sent to your email.",
      userId: user._id,
      // Development testing only. Never expose OTP in production.
      ...(process.env.NODE_ENV === "development" ? { otp } : {}),
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed. Check the backend logs.",
    });
  }
};

// ===============================
// VERIFY OTP
// ===============================

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+otp +otpExpiresAt +otpAttempts");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    if ((user.otpAttempts || 0) >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Request a new OTP.",
      });
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Request a new OTP.",
      });
    }

    if (String(user.otp) !== String(otp).trim()) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.isEmailVerified = true;
    user.isStudentVerified = true;
    user.verificationMethod = "college_email";

    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;

    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "College email verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        institute: user.institute,
        isEmailVerified: user.isEmailVerified,
        isStudentVerified: user.isStudentVerified,
        verificationMethod: user.verificationMethod,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

// ===============================
// LOGIN
// ===============================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your college email first",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

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
        isStudentVerified: user.isStudentVerified,
        verificationMethod: user.verificationMethod,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// ===============================
// CURRENT USER
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
      message: "Unable to get current user",
    });
  }
};

// ===============================
// UPDATE PROFILE
// ===============================

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const {
      name,
      department,
      year,
      semester,
      github,
      linkedin,
    } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name.trim();
    user.department = department?.trim() || "";
    user.github = github?.trim() || "";
    user.linkedin = linkedin?.trim() || "";

    if (year !== undefined && year !== "") {
      const parsedYear = Number(year);

      if (!Number.isInteger(parsedYear) || parsedYear < 1 || parsedYear > 6) {
        return res.status(400).json({
          success: false,
          message: "Year must be between 1 and 6",
        });
      }

      user.year = parsedYear;
    }

    if (semester !== undefined && semester !== "") {
      const parsedSemester = Number(semester);

      if (
        !Number.isInteger(parsedSemester) ||
        parsedSemester < 1 ||
        parsedSemester > 12
      ) {
        return res.status(400).json({
          success: false,
          message: "Semester must be between 1 and 12",
        });
      }

      user.semester = parsedSemester;
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
