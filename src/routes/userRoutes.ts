import express from 'express';
import {
    getUserProfile,
    updateMentorProfile,
    updateMenteeProfile,
    updateProfile
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.post('/mentor-profile', protect, updateMentorProfile);
router.post('/mentee-profile', protect, updateMenteeProfile);

export default router;
