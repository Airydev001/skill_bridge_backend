import express from 'express';
import { getAdminStats, getAllUsers, getReports, updateReportStatus } from '../controllers/adminController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Middleware to check for admin role
const admin = (req: any, res: any, next: any) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

router.use(protect);
router.use(admin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/reports', getReports);
router.patch('/reports/:id', updateReportStatus);

export default router;
