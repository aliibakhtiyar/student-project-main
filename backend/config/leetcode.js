const axios = require("axios");

const leetcodeAPI = axios.create({
  baseURL: "https://leetcode.com",
  headers: {
    "Content-Type": "application/json",
    Referer: "https://leetcode.com/",
    "User-Agent": "Mozilla/5.0",
  },
});

module.exports = leetcodeAPI;