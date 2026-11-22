// Server-only Grok client. Never send the API key or raw provider errors to the browser.
const axios = require('axios');

function providerFailure(err, model) {
  const httpStatus = err.response?.status;
  const providerCode = err.response?.data?.error?.code || err.response?.data?.code || err.code || 'unknown';
  // Safe diagnostics for Render logs: no API keys, prompts, responses, or headers.
  console.error('[Grok request]', {
    model,
    httpStatus: httpStatus || null,
    providerCode: String(providerCode).slice(0, 80),
  });

  let message = 'Grok is temporarily unavailable. Please try again.';
  let status = 502;
  let code = 'GROK_UPSTREAM_ERROR';

  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    message = 'Grok took too long to generate the challenge. Try 5 questions or try again.';
    status = 504;
    code = 'GROK_TIMEOUT';
  } else if (!err.response) {
    message = 'The backend could not connect to Grok. Please try again later.';
    code = 'GROK_NETWORK_ERROR';
  } else if (httpStatus === 401) {
    message = 'Grok API authentication failed. Check GROK_API_KEY in Render backend environment settings.';
    status = 503;
    code = 'GROK_INVALID_KEY';
  } else if (httpStatus === 402) {
    message = 'Grok API credits are unavailable. Check your API account billing.';
    status = 503;
    code = 'GROK_NO_CREDITS';
  } else if (httpStatus === 403) {
    message = 'Grok denied access to this model. Check your API key permissions and credits.';
    status = 503;
    code = 'GROK_ACCESS_DENIED';
  } else if (httpStatus === 404) {
    message = 'The Grok model was not found or is unavailable to your API key. Check GROK_CHAT_MODEL.';
    code = 'GROK_MODEL_UNAVAILABLE';
  } else if (httpStatus === 429) {
    message = 'Grok rate limit reached. Please try again shortly.';
    status = 429;
    code = 'GROK_RATE_LIMIT';
  } else if (httpStatus === 400 || httpStatus === 422) {
    message = 'Grok rejected the question-generation request. Check the model configuration.';
    code = 'GROK_INVALID_REQUEST';
  }

  const failure = new Error(message);
  failure.status = status;
  failure.code = code;
  return failure;
}

module.exports = {
  chat: {
    completions: {
      create: async (params) => {
        const apiKey = process.env.GROK_API_KEY?.trim();
        if (!apiKey) {
          const failure = new Error('Grok is not configured. Add GROK_API_KEY to the Render backend environment.');
          failure.status = 503;
          failure.code = 'GROK_NOT_CONFIGURED';
          throw failure;
        }

        const model = params.model || process.env.GROK_CHAT_MODEL || 'grok-4.7';
        try {
          const { data } = await axios.post(
            'https://api.x.ai/v1/chat/completions',
            { ...params, model },
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              timeout: 180000,
            }
          );
          return data;
        } catch (err) {
          throw providerFailure(err, model);
        }
      },
    },
  },
};
