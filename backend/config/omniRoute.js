const OpenAI = require("openai");

const client = new OpenAI({
  baseURL:
    process.env.OMNIROUTE_BASE_URL ||
    "http://localhost:20128/v1",

  apiKey: process.env.OMNIROUTE_API_KEY,
});

module.exports = client;