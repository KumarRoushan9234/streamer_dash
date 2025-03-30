import mongoose from "mongoose";
import User from "./models/user.model.js";

const MONGO_URI = "mongodb+srv://roushan:roushan@user.ebtzrje.mongodb.net/MoveINSync?retryWrites=true&w=majority&appName=user";

const verifyAllEmails = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");

    const result = await User.updateMany({}, { 
      $set: { 
        isEmailVerified: true,   
        isPhoneVerified: true    
      } 
    });

    console.log(`${result.modifiedCount} users verified successfully.`);

    await mongoose.disconnect(); 
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error updating users:", error);
  }
};

verifyAllEmails();
