const axios = require("axios");

const linkedinAPI = axios.create({
  baseURL: "https://api.linkedin.com",
  headers: {
    "Content-Type": "application/json",
  },
});

module.exports = linkedinAPI;