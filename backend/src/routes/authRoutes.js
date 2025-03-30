import express from 'express';
import { registerUser,loginUser,logoutUser,updateUser,checkAuth,forgotPassword,resetPassword,verifyEmail,getUserProfile} from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.post('/logout', logoutUser);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.put('/update-profile',protectRoute,updateUser);
router.get("/check-auth",protectRoute,checkAuth);
router.get("/profile/:id", getUserProfile);


export default router;
