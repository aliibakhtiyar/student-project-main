const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    institute: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    year: {
      type: Number,
      min: 1,
      max: 6,
    },

    semester: {
      type: Number,
      min: 1,
      max: 12,
    },

    skills: {
      type: [String],
      default: [],
    },

    interests: {
      type: [String],
      default: [],
    },

    profileImage: {
      type: String,
      default: "",
    },

    github: {
      type: String,
      default: "",
    },

    linkedin: {
      type: String,
      default: "",
    },

    resume: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    // Email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Student verification
    isStudentVerified: {
      type: Boolean,
      default: false,
    },

    verificationMethod: {
      type: String,
      enum: [
        "college_email",
        "student_id",
        "manual",
        "digilocker",
        null,
      ],
      default: null,
    },

    // OTP
    otp: {
      type: String,
      select: false,
    },

    otpExpiresAt: {
      type: Date,
      select: false,
    },

    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);