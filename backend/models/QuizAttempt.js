
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: (value) => value.length === 4,
    },
    correctAnswer: { type: Number, required: true },
    explanation: { type: String, default: "" },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    questions: [questionSchema],
    answers: [{ type: Number }],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "QuizAttempt",
  quizAttemptSchema
);
