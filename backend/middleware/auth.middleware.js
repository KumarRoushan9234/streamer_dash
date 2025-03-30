import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async(req,res,next) => {
  try{

    console.log("Checking Authentication...");
    console.log("Cookies received:", req.cookies);

    let token = req.cookies?.jwt;
    console.log("Token from Cookie:", token);

    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if(!token){
      return res.status(401).json({
        message: "Unauthorized: No token provided",
        success:false,
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: "Invalid or expired token",
        success: false,
      });
    }

    const user = await User.findById(decoded.userId).select("-password");
    
    if(!user){
      return res.status(404).json({
        message:"User not Found",
        success:false,
      });
    }

    req.user=user;
    next();
  }
  catch(e){
    console.log("Error in protectRoute middleware:",e);
    return res.status(401).json({
      message:"Internal Server Error in protected route",
      success:false,
    });
  }
};



