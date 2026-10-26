const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"UniSphere" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "UniSphere - Email Verification OTP",
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 500px;
        margin: auto;
        padding: 30px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
      ">
        <h2 style="color: #0f172a;">
          Welcome to UniSphere 🎓
        </h2>

        <p style="color: #64748b;">
          Use the following OTP to verify your college email:
        </p>

        <div style="
          margin: 25px 0;
          padding: 15px;
          background: #f8fafc;
          border-radius: 10px;
          text-align: center;
        ">
          <h1 style="
            letter-spacing: 8px;
            color: #0f172a;
            margin: 0;
          ">
            ${otp}
          </h1>
        </div>

        <p style="color: #64748b;">
          This OTP will expire in <strong>10 minutes</strong>.
        </p>

        <p style="
          color: #94a3b8;
          font-size: 12px;
          margin-top: 25px;
        ">
          If you did not create a UniSphere account, you can safely ignore
          this email.
        </p>
      </div>
    `,
  });
};

module.exports = sendOTPEmail;