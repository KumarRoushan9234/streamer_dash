import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { generateToken } from "../utils/generateToken.js";

dotenv.config();

// Email Transporter Setup (Using Nodemailer)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("Email Error:", error);
  } else {
    console.log("Email is ready to send messages");
  }
});


// --------------------- REGISTER USER ---------------------
export const registerUser = async (req, res) => {
  console.log("Request Body(register) : ", req.body);
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields.", success: false });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters.", success: false });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const emailverificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      emailverificationCode: emailverificationCode,
    });

    await newUser.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      text: `Your OTP for verification is: ${emailverificationCode}`,
    });

    return res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// --------------------- VERIFY EMAIL ---------------------
export const verifyEmail = async (req, res) => {
  
  const { email, otp } = req.body;
  console.log(otp, email);
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found", success: false });
    }

    if (user.emailverificationCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }

    user.isemailVerified = true;
    user.emailverificationCode = ""; 
    await user.save();

    return res.status(200).json({ message: "Email verified successfully!", success: true });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};


// --------------------- LOGIN USER ---------------------
export const loginUser = async (req, res) => {
  console.log("Request Body(login) : ", req.body);
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password", success: false });
    }

    // need phoneVerified only to check for create ride and book 

    if (!user.isemailVerified) {
      return res.status(401).json({ message: "Please verify your email before logging in.", success: false });
    }

    generateToken(user._id, res);

    return res.status(200).json({
      message: "User logged in successfully",
      success: true,
      data: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// --------------------- LOGOUT USER ---------------------
export const logoutUser = async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res.status(200).json({ message: "User logged out successfully!", success: true });
};

// --------------------- FORGOT PASSWORD ---------------------
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found", success: false });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetCode = resetToken;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${resetLink}`,
    });

    return res.status(200).json({ message: "Password reset email sent!", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// --------------------- RESET PASSWORD ---------------------
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({ passwordResetCode: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token", success: false });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetCode = "";
    await user.save();

    return res.status(200).json({ message: "Password reset successful!", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// --------------------- UPDATE PROFILE ---------------------
export const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    return res.status(200).json({
      message: "User updated successfully!",
      success: true,
      data: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// --------------------- CHECK AUTH ---------------------
export const checkAuth = async (req, res) => {
  try {
    return res.status(200).json({ message: "Authenticated", success: true, data: req.user });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// --------------------- GET PUBLIC PROFILE ---------------------
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params; // Get user ID from URL
    const user = await User.findById(id).select("-password -emailverificationCode -passwordResetCode");

    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    return res.status(200).json({
      message: "User profile fetched successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
