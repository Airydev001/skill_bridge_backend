import express from 'express';
import { findMatches } from '../controllers/matchController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, findMatches);

export default router;
