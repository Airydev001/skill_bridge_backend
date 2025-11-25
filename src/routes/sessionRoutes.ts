import express from 'express';
import { createSession, getSessions, updateSession, getSessionById } from '../controllers/sessionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/', createSession);
router.get('/', getSessions);
router.get('/:id', getSessionById);
router.patch('/:id', updateSession);

export default router;
