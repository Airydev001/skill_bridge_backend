import express from 'express';
import {
    createSession, getSessions, updateSession, getSessionById,
    forceSessionSummary,
    startSession
} from '../controllers/sessionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').post(protect, createSession).get(protect, getSessions);
router.route('/:id').get(protect, getSessionById).patch(protect, updateSession);
router.route('/:id/analyze').post(protect, forceSessionSummary);
router.route('/:id/start').post(protect, startSession);

export default router;
