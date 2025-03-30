import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  res.cookie("jwt", token, {
    httpOnly: true, 
    // secure: process.env.NODE_ENV === "production", 
    
    // sameSite: "none", 
    // secure: process.env.NODE_ENV === "production" ? true : false,
    
    secure: false, 
    sameSite: "lax",
    maxAge: 8 * 60 * 60 * 1000, 
  });
  console.log("✅ Token Set in Cookie:", token);
  return token; 
};
