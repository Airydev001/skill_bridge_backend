"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMatches = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../models/User"));
const MentorProfile_1 = __importDefault(require("../models/MentorProfile"));
const MenteeProfile_1 = __importDefault(require("../models/MenteeProfile"));
// Helper function to calculate cosine similarity
const cosineSimilarity = (vecA, vecB) => {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
};
// @desc    Find matches for the current user
// @route   GET /api/matches
// @access  Private
exports.findMatches = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    let userEmbedding;
    let candidates = [];
    let candidateType = '';
    // 1. Get current user's embedding
    if (user.role === 'mentee') {
        const profile = yield MenteeProfile_1.default.findOne({ userId: user._id });
        if (!profile || !profile.embedding) {
            res.status(400);
            throw new Error('Profile or embedding not found. Please update your profile first.');
        }
        userEmbedding = profile.embedding;
        // Find Mentors
        candidates = yield MentorProfile_1.default.find({ embedding: { $exists: true } }).populate('userId', 'name avatarUrl');
        candidateType = 'mentor';
    }
    else if (user.role === 'mentor') {
        const profile = yield MentorProfile_1.default.findOne({ userId: user._id });
        if (!profile || !profile.embedding) {
            res.status(400);
            throw new Error('Profile or embedding not found. Please update your profile first.');
        }
        userEmbedding = profile.embedding;
        // Find Mentees
        candidates = yield MenteeProfile_1.default.find({ embedding: { $exists: true } }).populate('userId', 'name avatarUrl');
        candidateType = 'mentee';
    }
    else {
        res.status(400);
        throw new Error('Admin cannot use matching feature');
    }
    // 2. Calculate Similarity Scores
    const matches = candidates.map(candidate => {
        if (!candidate.embedding || !userEmbedding)
            return null;
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
    matches.sort((a, b) => ((b === null || b === void 0 ? void 0 : b.score) || 0) - ((a === null || a === void 0 ? void 0 : a.score) || 0));
    res.json(matches);
}));
