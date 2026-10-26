const axios = require("axios");

const STUDENT_OFFERS_URL =
  "https://www.studentoffers.co/api/v1/offers";

const getStudentOffers = async () => {
  try {
    const response = await axios.get(STUDENT_OFFERS_URL, {
      timeout: 30000,
      maxRedirects: 5,

      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.studentoffers.co/",
      },
    });

    return response.data;
  } catch (error) {
    console.error("StudentOffers Error");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.message);

    throw error;
  }
};

module.exports = {
  getStudentOffers,
};