
const client = require("../config/groq");
const QuizAttempt = require("../models/QuizAttempt");

const MODEL =
  process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-120b";

const generateQuiz = async (req, res) => {
  try {
    const { topic, difficulty = "Medium", count = 10 } = req.body;

    const total = Number(count);

    if (!topic?.trim()) {
      return res.status(400).json({
        message: "Please enter a topic",
      });
    }

    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      return res.status(400).json({
        message: "Invalid difficulty",
      });
    }

    if (![5, 10, 15].includes(total)) {
      return res.status(400).json({
        message: "Question count must be 5, 10, or 15",
      });
    }

    const response = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      max_completion_tokens: 5000,
      messages: [
        {
          role: "system",
          content: `
You generate accurate educational multiple-choice quizzes.
Return ONLY valid JSON, with no markdown fences.

Required format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explain the correct answer"
    }
  ]
}

Rules:
- Generate exactly the requested number of questions.
- Every question must have exactly four distinct options.
- correctAnswer must be an integer from 0 to 3.
- Only one option must be correct.
- Questions must match the requested topic and difficulty.
- Keep explanations factually accurate.
- Do not include answers outside the JSON object.
          `.trim(),
        },
        {
          role: "user",
          content: JSON.stringify({
            topic: topic.trim(),
            difficulty,
            count: total,
          }),
        },
      ],
    });

    const raw = response.choices[0]?.message?.content;

    if (!raw) {
      throw new Error("Empty AI response");
    }

    const parsed = JSON.parse(
      raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    );

    const questions = parsed.questions;

    if (
      !Array.isArray(questions) ||
      questions.length !== total ||
      questions.some(
        (q) =>
          typeof q.question !== "string" ||
          !q.question.trim() ||
          !Array.isArray(q.options) ||
          q.options.length !== 4 ||
          q.options.some(
            (option) =>
              typeof option !== "string" || !option.trim()
          ) ||
          new Set(q.options.map((o) => o.trim().toLowerCase())).size !== 4 ||
          !Number.isInteger(q.correctAnswer) ||
          q.correctAnswer < 0 ||
          q.correctAnswer > 3 ||
          typeof q.explanation !== "string"
      )
    ) {
      throw new Error("AI returned an invalid quiz format");
    }

    const attempt = await QuizAttempt.create({
      user: req.user._id,
      topic: topic.trim(),
      difficulty,
      questions,
      totalQuestions: total,
    });

    // Never expose correctAnswer before submission.
    return res.status(201).json({
      quizId: attempt._id,
      topic: attempt.topic,
      difficulty: attempt.difficulty,
      questions: questions.map((q, index) => ({
        id: index,
        question: q.question,
        options: q.options,
      })),
    });
  } catch (error) {
    console.error("Generate Quiz Error:", error.message);

    return res.status(500).json({
      message: "Could not generate quiz. Please try again.",
    });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    if (
      !Array.isArray(answers) ||
      answers.some(
        (answer) =>
          !Number.isInteger(answer) ||
          answer < 0 ||
          answer > 3
      )
    ) {
      return res.status(400).json({
        message: "Invalid answers",
      });
    }

    const attempt = await QuizAttempt.findOne({
      _id: quizId,
      user: req.user._id,
    });

    if (!attempt) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    if (attempt.completed) {
      return res.status(409).json({
        message: "This quiz has already been submitted",
      });
    }

    if (answers.length !== attempt.questions.length) {
      return res.status(400).json({
        message: "Please answer every question",
      });
    }

    const results = attempt.questions.map((q, index) => ({
      question: q.question,
      options: q.options,
      selectedAnswer: answers[index],
      correctAnswer: q.correctAnswer,
      isCorrect: answers[index] === q.correctAnswer,
      explanation: q.explanation,
    }));

    const score = results.filter((r) => r.isCorrect).length;

    attempt.answers = answers;
    attempt.score = score;
    attempt.percentage = Math.round(
      (score / attempt.totalQuestions) * 100
    );
    attempt.completed = true;

    await attempt.save();

    return res.json({
      score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      results,
    });
  } catch (error) {
    console.error("Submit Quiz Error:", error.message);

    return res.status(500).json({
      message: "Could not submit quiz",
    });
  }
};

const getQuizHistory = async (req, res) => {
  try {
    const history = await QuizAttempt.find({
      user: req.user._id,
      completed: true,
    })
      .select("topic difficulty score totalQuestions percentage createdAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({ history });
  } catch (error) {
    console.error("Quiz History Error:", error.message);

    return res.status(500).json({
      message: "Could not load quiz history",
    });
  }
};

module.exports = {
  generateQuiz,
  submitQuiz,
  getQuizHistory,
};
