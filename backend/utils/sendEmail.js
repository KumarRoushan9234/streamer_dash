import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, 
  
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, 
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("Email Transporter Error:", error);
  } else {
    console.log("Email transporter is ready");
  }
});


export const sendEmail = async (to, subject, message) => {
  try {
    const mailOptions = {
      from: `"YourApp Support" <${process.env.EMAIL_USER}>`, 
      to,
      subject,
      text: message, 
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 10px;">
          <h2>${subject}</h2>
          <p>${message}</p>
          <hr/>
          <small style="color: gray;">If you did not request this email, please ignore it.</small>
        </div>
      `,
      headers: {
        "X-Priority": "1", 
        "X-Mailer": "YourApp Mailer", 
      },
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} - ${subject}`);
    return true;
  } catch (error) {
    console.error("Email Sending Error:", error);
    return false;
  }
};
