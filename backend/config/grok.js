// Backward-compatible import for existing controllers.
// All production AI requests now use the Groq Cloud free-tier client.
// This module does not call xAI or grok-api.com.
module.exports = require('./groq');
