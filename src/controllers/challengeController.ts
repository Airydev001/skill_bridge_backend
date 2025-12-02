import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Challenge from '../models/Challenge';
import User from '../models/User';
import { generateChallenge, evaluateSubmission } from '../services/aiService';

// @desc    Generate a new challenge
// @route   POST /api/challenges/generate
// @access  Private
export const createChallenge = asyncHandler(async (req: Request, res: Response) => {
    const { topic, difficulty } = req.body;

    const aiChallenge = await generateChallenge(topic, difficulty);

    if (!aiChallenge) {
        res.status(500);
        throw new Error('Failed to generate challenge');
    }

    const challenge = await Challenge.create({
        menteeId: req.user._id,
        title: aiChallenge.title,
        description: aiChallenge.description,
        difficulty: aiChallenge.difficulty,
        category: aiChallenge.category,
        status: 'pending',
        points: 0 // Points awarded upon completion
    });

    res.status(201).json({ ...challenge.toObject(), starterCode: aiChallenge.starterCode });
});

// @desc    Get my challenges
// @route   GET /api/challenges/my
// @access  Private
export const getMyChallenges = asyncHandler(async (req: Request, res: Response) => {
    const challenges = await Challenge.find({ menteeId: req.user._id }).sort({ createdAt: -1 });
    res.json(challenges);
});

// @desc    Get challenge by ID
// @route   GET /api/challenges/:id
// @access  Private
export const getChallengeById = asyncHandler(async (req: Request, res: Response) => {
    const challenge = await Challenge.findById(req.params.id);

    if (challenge) {
        res.json(challenge);
    } else {
        res.status(404);
        throw new Error('Challenge not found');
    }
});

// @desc    Submit a challenge solution
// @route   POST /api/challenges/:id/submit
// @access  Private
export const submitChallenge = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
        res.status(404);
        throw new Error('Challenge not found');
    }

    if (challenge.menteeId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    // AI Evaluation
    const evaluation = await evaluateSubmission(challenge, code);

    challenge.submission = {
        code,
        submittedAt: new Date()
    };

    if (evaluation) {
        challenge.aiEvaluation = {
            score: evaluation.score,
            feedback: evaluation.feedback,
            passed: evaluation.passed
        };

        if (evaluation.passed) {
            challenge.status = 'graded';
            // Award points based on difficulty
            let pointsAwarded = 0;
            if (challenge.difficulty === 'Easy') pointsAwarded = 10;
            if (challenge.difficulty === 'Medium') pointsAwarded = 20;
            if (challenge.difficulty === 'Hard') pointsAwarded = 30;

            challenge.points = pointsAwarded;

            // Update user points
            const user = await User.findById(req.user._id);
            if (user) {
                user.points = (user.points || 0) + pointsAwarded;
                await user.save();
            }
        } else {
            challenge.status = 'submitted'; // Submitted but failed
        }
    } else {
        challenge.status = 'submitted'; // Fallback if AI fails
    }

    await challenge.save();
    res.json(challenge);
});
