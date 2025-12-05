import express from 'express';
import { getAdminStats, getAllUsers, getReports, updateReportStatus, verifyMentor } from '../controllers/adminController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// All routes here are protected and require admin role
router.use(protect);
router.use(admin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/reports', getReports);
router.patch('/reports/:id', updateReportStatus);
router.put('/mentors/:id/verify', verifyMentor);

export default router;
