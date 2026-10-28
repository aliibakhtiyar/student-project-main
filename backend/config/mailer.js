
const transporter = {
  async sendMail({ to, subject, text }) {
    const apiKey = process.env.SENDLIBERTY_API_KEY;
    const from = process.env.SENDLIBERTY_FROM;

    if (!apiKey || !from) {
      throw new Error(
        "SENDLIBERTY_API_KEY or SENDLIBERTY_FROM is missing"
      );
    }

    const response = await fetch(
      "https://sendliberty.com/api/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: Array.isArray(to) ? to.join(",") : to,
          subject,
          html: `<div style="font-family:Arial,sans-serif">
            <h2>UniSphere Email Verification</h2>
            <p>${text
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/\n/g, "<br>")}</p>
          </div>`,
        }),
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Sendliberty API error:", result);
      throw new Error(
        result.message || `Email API failed: ${response.status}`
      );
    }

    console.log("Sendliberty accepted email request:", result);
    return result;
  },
};

module.exports = transporter;
