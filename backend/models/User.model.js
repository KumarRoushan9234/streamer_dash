import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },
    emailVerificationCode:{type:String,default:"1234"},
    isEmailVerified: { type: Boolean, default: false },

    phone: { type: String, unique: true, sparse: true },
    isPhoneVerified: { type: Boolean, default: false },

    password: { type: String },
    profilePicture: { type: String, default: "" },

    bio: { type: String, default: "" }, 
    
    customStatus: { type: String, default: "Online" }, 

    isAccountBanned: { type: Boolean, default: false },

    role: { type: String, enum: ["user", "moderator", "admin"], default: "user" },

    socialLogins: {
      googleId: { type: String, unique: true, sparse: true },
      twitchId: { type: String, unique: true, sparse: true },
      githubId: { type: String, unique: true, sparse: true },
      firebaseId: { type: String, unique: true, sparse: true },
    },
    
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    activeStream: { type: mongoose.Schema.Types.ObjectId, ref: "Stream", default: null },
    currentRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],

    friendRequests: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
        sentAt: { type: Date, default: Date.now },
      },
    ],

    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    badges: [{ type: String }], 
    

    totalWatchTime: { type: Number, default: 0 }, 
    
    totalDonationsReceived: { type: Number, default: 0 },

    preferences: {
      theme: { type: String, enum: ["light", "dark"], default: "dark" },
      notifications: { type: Boolean, default: true },
      language: { type: String, default: "en" },
    },

    wallet: {
      balance: { type: Number, default: 0 },
      transactions: [
        {
          type: { type: String, enum: ["deposit", "withdrawal", "donation"], required: true },
          amount: { type: Number, required: true },
          date: { type: Date, default: Date.now },
        },
      ],
    },

    privacy: {
      canReceiveMessages: { type: Boolean, default: true },
      showOnlineStatus: { type: Boolean, default: true },
      allowFriendRequests: { type: Boolean, default: true },
    },

    is2FAEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);


// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password") || !this.password) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

export default mongoose.model("User", userSchema);
