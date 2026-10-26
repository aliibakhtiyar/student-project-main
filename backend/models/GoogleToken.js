const mongoose = require("mongoose");

const googleTokenSchema = new mongoose.Schema(
  {
    accessToken: {
      type: String,
      required: true,
    },

    refreshToken: {
      type: String,
      required: true,
    },

    expiryDate: {
      type: Number,
      default: null,
    },

    scope: {
      type: String,
      default: "",
    },

    tokenType: {
      type: String,
      default: "Bearer",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "GoogleToken",
  googleTokenSchema
);