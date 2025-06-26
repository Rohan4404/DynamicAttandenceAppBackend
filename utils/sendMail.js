const nodemailer = require("nodemailer");

const sendMail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true, // Use true for port 465
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"HR Management" <${process.env.EMAIL}>`,
    to,
    subject,
    text,
  });
};

module.exports = sendMail;
