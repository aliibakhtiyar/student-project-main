// Shared, server-only Grok client. API key is never sent to the browser.
const axios = require('axios');

const client = {
  chat: {
    completions: {
      create: async (params) => {
        if (!process.env.GROK_API_KEY) {
          const error = new Error('GROK_API_KEY is not configured on the backend');
          error.status = 503;
          throw error;
        }
        try {
          const { data } = await axios.post(
            'https://api.x.ai/v1/chat/completions',
            { ...params, model: params.model || process.env.GROK_CHAT_MODEL || 'grok-4.7' },
            {
              headers: {
                Authorization: `Bearer ${process.env.GROK_API_KEY}`,
                'Content-Type': 'application/json',
              },
              timeout: 90000,
            }
          );
          return data;
        } catch (err) {
          const error = new Error(
            err.response?.status === 429
              ? 'AI request limit reached. Please try again later.'
              : 'Grok API request failed.'
          );
          error.status = err.response?.status || 502;
          throw error;
        }
      },
    },
  },
};

module.exports = client;
