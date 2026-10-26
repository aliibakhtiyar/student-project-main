require("dotenv").config();

const axios = require("axios");

const testEvents = async () => {
  try {
    console.log(
      "API key loaded:",
      Boolean(process.env.OPENWEBNINJA_API_KEY)
    );

    const response = await axios.get(
      "https://api.openwebninja.com/realtime-events-data/search-events",
      {
        params: {
          query: "technology events in India",
        },
        headers: {
          "X-API-Key":
            process.env.OPENWEBNINJA_API_KEY,
        },
        timeout: 60000,
      }
    );

    console.log("STATUS:", response.status);

    console.log(
      JSON.stringify(response.data, null, 2)
    );
  } catch (error) {
    console.log(
      "STATUS:",
      error.response?.status
    );

    console.log(
      "DATA:",
      error.response?.data
    );

    console.log(
      "MESSAGE:",
      error.message
    );
  }
};

testEvents();