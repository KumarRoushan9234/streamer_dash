import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Email Transporter Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email Sending Function
export const sendEmail = async (to, subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: `<h1>${subject}</h1><p>${message}</p><i>Carma - "Good karma" for ride-sharing</i>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to} - ${subject}`);
  } catch (error) {
    console.log("❌ Email Error:", error);
  }
};
