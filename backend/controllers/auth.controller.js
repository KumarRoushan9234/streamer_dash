import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { generateToken } from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";

dotenv.config();

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

    const emailVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      emailVerificationCode: emailVerificationCode,
    });

    await newUser.save();

    const emailSent = await sendEmail(
      email,
      "Verify Your Email",
      `Your OTP for verification is: <strong>${emailVerificationCode}</strong>`
    );

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send verification email.", success: false });
    }

    return res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const verifyEmail = async (req, res) => {
  
  const { email, otp } = req.body;
  console.log(otp, email);
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found", success: false });
    }

    if (user.emailVerificationCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = "1234"; 
    await user.save();

    return res.status(200).json({ message: "Email verified successfully!", success: true });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

// add resend otp

export const loginUser = async (req, res) => {
  console.log("Request Body (login):", req.body);
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password", success: false });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password", success: false });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in.", success: false });
    }

    generateToken(user._id, res);

    return res.status(200).json({
      message: "User logged in successfully",
      success: true,
      data: { _id: user._id, name: user.name, email: user.email },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};


export const logoutUser = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  return res.status(200).json({ message: "User logged out successfully!", success: true });
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, bio, customStatus, profilePicture } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found", success: false });

    if (name) user.name = name;
    if (email) user.email = email;
    if (bio) user.bio = bio;
    if (customStatus) user.customStatus = customStatus;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();
    return res.status(200).json({ message: "Profile updated successfully!", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const checkAuth = async (req, res) => {
  try {
    return res.status(200).json({ message: "Authenticated", success: true, data: req.user });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
