import express from 'express';
import { registerUser,loginUser,logoutUser,updateUser,checkAuth,verifyEmail,} from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post("/verify-email", verifyEmail);

router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.put('/update-profile',protectRoute,updateUser);
router.get("/check-auth",protectRoute,checkAuth);

export default router;
