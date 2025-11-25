import express from 'express';
import { getMentors, getMentorById, getMentorSlots } from '../controllers/mentorController';

const router = express.Router();

router.get('/', getMentors);
router.get('/:id', getMentorById);
router.get('/:id/slots', getMentorSlots);

export default router;
