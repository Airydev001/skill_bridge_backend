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
exports.submitChallenge = exports.getChallengeById = exports.getMyChallenges = exports.createChallenge = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Challenge_1 = __importDefault(require("../models/Challenge"));
const User_1 = __importDefault(require("../models/User"));
const aiService_1 = require("../services/aiService");
// @desc    Generate a new challenge
// @route   POST /api/challenges/generate
// @access  Private
exports.createChallenge = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { topic, difficulty } = req.body;
    const aiChallenge = yield (0, aiService_1.generateChallenge)(topic, difficulty);
    if (!aiChallenge) {
        res.status(500);
        throw new Error('Failed to generate challenge');
    }
    const challenge = yield Challenge_1.default.create({
        menteeId: req.user._id,
        title: aiChallenge.title,
        description: aiChallenge.description,
        difficulty: aiChallenge.difficulty,
        category: aiChallenge.category,
        status: 'pending',
        points: 0 // Points awarded upon completion
    });
    res.status(201).json(Object.assign(Object.assign({}, challenge.toObject()), { starterCode: aiChallenge.starterCode }));
}));
// @desc    Get my challenges
// @route   GET /api/challenges/my
// @access  Private
exports.getMyChallenges = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const challenges = yield Challenge_1.default.find({ menteeId: req.user._id }).sort({ createdAt: -1 });
    res.json(challenges);
}));
// @desc    Get challenge by ID
// @route   GET /api/challenges/:id
// @access  Private
exports.getChallengeById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const challenge = yield Challenge_1.default.findById(req.params.id);
    if (challenge) {
        res.json(challenge);
    }
    else {
        res.status(404);
        throw new Error('Challenge not found');
    }
}));
// @desc    Submit a challenge solution
// @route   POST /api/challenges/:id/submit
// @access  Private
exports.submitChallenge = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.body;
    const challenge = yield Challenge_1.default.findById(req.params.id);
    if (!challenge) {
        res.status(404);
        throw new Error('Challenge not found');
    }
    if (challenge.menteeId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }
    // AI Evaluation
    const evaluation = yield (0, aiService_1.evaluateSubmission)(challenge, code);
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
            if (challenge.difficulty === 'Easy')
                pointsAwarded = 10;
            if (challenge.difficulty === 'Medium')
                pointsAwarded = 20;
            if (challenge.difficulty === 'Hard')
                pointsAwarded = 30;
            challenge.points = pointsAwarded;
            // Update user points
            const user = yield User_1.default.findById(req.user._id);
            if (user) {
                user.points = (user.points || 0) + pointsAwarded;
                yield user.save();
            }
        }
        else {
            challenge.status = 'submitted'; // Submitted but failed
        }
    }
    else {
        challenge.status = 'submitted'; // Fallback if AI fails
    }
    yield challenge.save();
    res.json(challenge);
}));
