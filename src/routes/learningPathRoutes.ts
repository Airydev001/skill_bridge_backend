import express from 'express';
import { createPath, getPath, deletePath, generateResources } from '../controllers/learningPathController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createPath);
router.get('/', protect, getPath);
router.delete('/', protect, deletePath);
router.post('/resources', protect, generateResources);

export default router;
