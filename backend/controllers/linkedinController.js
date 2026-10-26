const axios = require("axios");

// =====================================================
// START LINKEDIN LOGIN
// =====================================================

const connectLinkedIn = (req, res) => {
  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_CALLBACK_URL;

    if (!clientId || !redirectUri) {
      return res.status(500).json({
        success: false,
        message: "LinkedIn environment variables are missing",
      });
    }

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "openid profile email",
    });

    const linkedinURL =
      `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

    res.redirect(linkedinURL);

  } catch (error) {
    console.error("LinkedIn connect error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to connect LinkedIn",
    });
  }
};


// =====================================================
// LINKEDIN CALLBACK
// =====================================================

const linkedInCallback = async (req, res) => {
  try {
    const { code, error, error_description } = req.query;

    // User denied access
    if (error) {
      console.error(
        "LinkedIn OAuth error:",
        error_description
      );

      return res.redirect(
        "http://localhost:5173/public-profile?linkedin=error"
      );
    }

    // No authorization code
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code not received",
      });
    }


    // ===================================================
    // EXCHANGE CODE FOR ACCESS TOKEN
    // ===================================================

    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",

      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri:
          process.env.LINKEDIN_CALLBACK_URL,
        client_id:
          process.env.LINKEDIN_CLIENT_ID,
        client_secret:
          process.env.LINKEDIN_CLIENT_SECRET,
      }).toString(),

      {
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken =
      tokenResponse.data.access_token;


    // ===================================================
    // GET LINKEDIN USER INFO
    // ===================================================

    const userResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      }
    );

    const user = userResponse.data;


    // ===================================================
    // TEMPORARY STORAGE
    // ===================================================

    global.linkedinAccessToken =
      accessToken;

    global.linkedinProfile = {
      id: user.sub || "",
      name: user.name || "",
      firstName: user.given_name || "",
      lastName: user.family_name || "",
      picture: user.picture || "",
      email: user.email || "",
      emailVerified:
        user.email_verified || false,
      locale: user.locale || null,
    };


    console.log(
      "LinkedIn connected successfully:"
    );

    console.log(
      global.linkedinProfile
    );


    // ===================================================
    // REDIRECT TO FRONTEND
    // ===================================================

    res.redirect(
      "http://localhost:5173/public-profile?linkedin=connected"
    );

  } catch (error) {

    console.error(
      "LinkedIn callback error:",
      error.response?.data ||
        error.message
    );

    res.redirect(
      "http://localhost:5173/public-profile?linkedin=error"
    );
  }
};


// =====================================================
// GET LINKEDIN PROFILE
// =====================================================

const getLinkedInProfile = async (req, res) => {
  try {

    // Already connected
    if (global.linkedinProfile) {
      return res.json({
        success: true,
        connected: true,
        linkedin:
          global.linkedinProfile,
      });
    }


    // No token
    if (!global.linkedinAccessToken) {
      return res.status(401).json({
        success: false,
        connected: false,
        message:
          "LinkedIn account is not connected",
      });
    }


    // Fetch again from LinkedIn
    const response = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization:
            `Bearer ${global.linkedinAccessToken}`,
        },
      }
    );


    const user = response.data;


    const profile = {
      id: user.sub || "",
      name: user.name || "",
      firstName:
        user.given_name || "",
      lastName:
        user.family_name || "",
      picture:
        user.picture || "",
      email:
        user.email || "",
      emailVerified:
        user.email_verified || false,
      locale:
        user.locale || null,
    };


    global.linkedinProfile =
      profile;


    res.json({
      success: true,
      connected: true,
      linkedin: profile,
    });

  } catch (error) {

    console.error(
      "Get LinkedIn profile error:",
      error.response?.data ||
        error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch LinkedIn profile",
    });
  }
};


// =====================================================
// CHECK STATUS
// =====================================================

const getLinkedInStatus = (req, res) => {

  res.json({
    success: true,
    connected:
      !!global.linkedinProfile,
  });

};


// =====================================================
// DISCONNECT
// =====================================================

const disconnectLinkedIn = (req, res) => {

  global.linkedinAccessToken = null;

  global.linkedinProfile = null;

  res.json({
    success: true,
    message:
      "LinkedIn disconnected successfully",
  });

};


module.exports = {
  connectLinkedIn,
  linkedInCallback,
  getLinkedInProfile,
  getLinkedInStatus,
  disconnectLinkedIn,
};