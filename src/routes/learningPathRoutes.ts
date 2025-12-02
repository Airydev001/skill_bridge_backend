import express from 'express';
import { createPath, getPath } from '../controllers/learningPathController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createPath);
router.get('/', protect, getPath);

export default router;
