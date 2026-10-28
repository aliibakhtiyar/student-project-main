
const client = require("../config/groq");

const MODEL =
  process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-120b";

// Generate Resume Summary
const generateResumeSummary = async (req, res) => {
  try {
    const { resume } = req.body;

    if (!resume?.personal?.name) {
      return res.status(400).json({
        success: false,
        message: "Enter your name first",
      });
    }

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a professional resume writer. Generate a concise, ATS-friendly resume summary using only the student's provided information. Never invent skills, experience, or achievements. Return only the summary.",
        },
        {
          role: "user",
          content: JSON.stringify(resume),
        },
      ],
      temperature: 0.5,
      max_completion_tokens: 500,
    });

    const summary =
      response.choices[0]?.message?.content?.trim();

    if (!summary) {
      return res.status(502).json({
        success: false,
        message: "AI returned an empty summary",
      });
    }

    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Resume Summary Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate resume summary",
    });
  }
};

// Improve Project Description
const improveResumeProject = async (req, res) => {
  try {
    const { project } = req.body;

    if (!project?.title?.trim() || !project?.description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project title and description are required",
      });
    }

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical resume writer. Improve the project description using concise, professional, ATS-friendly language. Highlight the actual features and technologies provided. Never invent features, metrics, or achievements. Return only the improved description.",
        },
        {
          role: "user",
          content: JSON.stringify(project),
        },
      ],
      temperature: 0.5,
      max_completion_tokens: 700,
    });

    const description =
      response.choices[0]?.message?.content?.trim();

    if (!description) {
      return res.status(502).json({
        success: false,
        message: "AI returned an empty description",
      });
    }

    return res.status(200).json({
      success: true,
      description,
    });
  } catch (error) {
    console.error("Project Improvement Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to improve project description",
    });
  }
};

module.exports = {
  generateResumeSummary,
  improveResumeProject,
};
