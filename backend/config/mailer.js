
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const transporter = {
  async sendMail({ from, to, subject, text }) {
    const { data, error } = await resend.emails.send({
      from: "UniSphere <onboarding@resend.dev>",
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(error.message || "Email sending failed");
    }

    return data;
  },
};

module.exports = transporter;
