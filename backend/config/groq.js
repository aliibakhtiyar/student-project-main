// Shared server-only Groq Cloud client for UniSphere.
// A key from grok-api.com or xAI is NOT interchangeable with GROQ_API_KEY.
const axios = require('axios');

const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-oss-120b';

function createError(message, status, code) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

function safeProviderError(err, model) {
  const httpStatus = err.response?.status;
  const providerCode = err.response?.data?.error?.code || err.response?.data?.error?.type || err.code || 'unknown';

  // Diagnostic metadata only: never log keys, headers, prompts or response text.
  console.error('[Groq Cloud]', {
    model,
    status: httpStatus || null,
    providerCode: String(providerCode).slice(0, 100),
  });

  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    return createError('The free AI model timed out. Please try again.', 504, 'AI_TIMEOUT');
  }
  if (!err.response) {
    return createError('The backend could not connect to Groq Cloud.', 502, 'AI_NETWORK_ERROR');
  }
  switch (httpStatus) {
    case 400:
    case 422:
      return createError('The AI provider rejected the request format. Please try again.', 502, 'AI_INVALID_REQUEST');
    case 401:
      return createError('Invalid Groq Cloud API key. Check GROQ_API_KEY in the Render backend environment.', 503, 'AI_INVALID_KEY');
    case 402:
      return createError('Groq Cloud API credits or billing are unavailable for this account.', 503, 'AI_NO_CREDITS');
    case 403:
      return createError('This Groq Cloud account cannot access the selected model.', 503, 'AI_ACCESS_DENIED');
    case 404:
      return createError('The configured Groq Cloud model is unavailable. Check GROQ_CHAT_MODEL.', 503, 'AI_MODEL_UNAVAILABLE');
    case 413:
      return createError('The AI request is too large. Please shorten the input.', 413, 'AI_REQUEST_TOO_LARGE');
    case 429:
      return createError('Free AI rate limit reached. Please try again shortly or generate fewer questions.', 429, 'AI_RATE_LIMIT');
    default:
      return createError('The free AI provider is temporarily unavailable.', 502, 'AI_UPSTREAM_ERROR');
  }
}

const client = {
  chat: {
    completions: {
      async create(params) {
        const key = process.env.GROQ_API_KEY?.trim();
        if (!key) {
          throw createError(
            'AI is not configured. Add GROQ_API_KEY to your backend Render Environment.',
            503,
            'AI_NOT_CONFIGURED'
          );
        }
        const model = params.model || process.env.GROQ_CHAT_MODEL || DEFAULT_MODEL;
        try {
          const { data } = await axios.post(
            BASE_URL,
            { ...params, model },
            {
              headers: {
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json',
              },
              timeout: 90000,
            }
          );
          return data;
        } catch (err) {
          throw safeProviderError(err, model);
        }
      },
    },
  },
};

module.exports = client;
