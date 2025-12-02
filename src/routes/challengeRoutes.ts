import express from 'express';
import { createChallenge, getMyChallenges, getChallengeById, submitChallenge } from '../controllers/challengeController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/generate', protect, createChallenge);
router.get('/my', protect, getMyChallenges);
router.get('/:id', protect, getChallengeById);
router.post('/:id/submit', protect, submitChallenge);

export default router;
