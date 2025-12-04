import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import MentorProfile from '../models/MentorProfile';
import MenteeProfile from '../models/MenteeProfile';

// Helper function to calculate cosine similarity
const cosineSimilarity = (vecA: number[], vecB: number[]) => {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
};

// @desc    Find matches for the current user
// @route   GET /api/matches
// @access  Private
export const findMatches = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    let userEmbedding: number[] | undefined;
    let candidates: any[] = [];
    let candidateType = '';

    // 1. Get current user's embedding
    if (user.role === 'mentee') {
        const profile = await MenteeProfile.findOne({ userId: user._id });
        if (!profile || !profile.embedding) {
            res.status(400);
            throw new Error('Profile or embedding not found. Please update your profile first.');
        }
        userEmbedding = profile.embedding;

        // Find Mentors
        candidates = await MentorProfile.find({ embedding: { $exists: true } }).populate('userId', 'name avatarUrl');
        candidateType = 'mentor';

    } else if (user.role === 'mentor') {
        const profile = await MentorProfile.findOne({ userId: user._id });
        if (!profile || !profile.embedding) {
            res.status(400);
            throw new Error('Profile or embedding not found. Please update your profile first.');
        }
        userEmbedding = profile.embedding;

        // Find Mentees
        candidates = await MenteeProfile.find({ embedding: { $exists: true } }).populate('userId', 'name avatarUrl');
        candidateType = 'mentee';
    } else {
        res.status(400);
        throw new Error('Admin cannot use matching feature');
    }

    // 2. Calculate Similarity Scores
    const matches = candidates.map(candidate => {
        if (!candidate.embedding || !userEmbedding) return null;

        const score = cosineSimilarity(userEmbedding, candidate.embedding);

        return {
            _id: candidate._id,
            userId: candidate.userId,
            score: score,
            matchPercentage: Math.round(score * 100),
            bio: candidate.bio, // For mentors
            skills: candidate.skills, // For mentors
            interests: candidate.interests, // For mentees
            learningGoals: candidate.learningGoals // For mentees
        };
    }).filter(match => match !== null);

    // 3. Sort by Score (Descending)
    matches.sort((a, b) => (b?.score || 0) - (a?.score || 0));

    res.json(matches);
});
