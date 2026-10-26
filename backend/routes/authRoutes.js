const express = require("express");

const {
  register,
  verifyOTP,
  login,
  getMe,
  updateProfile,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  body,
  validationResult,
} = require("express-validator");

const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  next();
};

// ===============================
// REGISTER
// ===============================

router.post(
  "/register",

  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage(
        "Name must be between 2 and 50 characters"
      ),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required"),

    body("password")
      .isLength({ min: 8 })
      .withMessage(
        "Password must be at least 8 characters"
      ),

    body("institute")
      .trim()
      .notEmpty()
      .withMessage("Institute is required"),

    body("department")
      .optional()
      .trim(),

    body("year")
      .optional()
      .isInt({ min: 1, max: 6 })
      .withMessage("Invalid year"),

    body("semester")
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage("Invalid semester"),
  ],

  validateRequest,

  register
);

// ===============================
// VERIFY OTP
// ===============================

router.post(
  "/verify-otp",

  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required"),

    body("otp")
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits")
      .isNumeric()
      .withMessage("OTP must contain only numbers"),
  ],

  validateRequest,

  verifyOTP
);

// ===============================
// LOGIN
// ===============================

router.post(
  "/login",

  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required"),

    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],

  validateRequest,

  login
);

// ===============================
// CURRENT USER
// ===============================

router.get(
  "/me",
  authMiddleware,
  getMe
);
router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

module.exports = router;