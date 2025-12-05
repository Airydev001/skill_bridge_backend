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
exports.updateProfile = exports.updateMenteeProfile = exports.updateMentorProfile = exports.getUserProfile = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../models/User"));
const MentorProfile_1 = __importDefault(require("../models/MentorProfile"));
const MenteeProfile_1 = __importDefault(require("../models/MenteeProfile"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findById(req.user._id);
    if (user) {
        let profileData = null;
        if (user.role === 'mentor') {
            profileData = yield MentorProfile_1.default.findOne({ userId: user._id });
        }
        else if (user.role === 'mentee') {
            profileData = yield MenteeProfile_1.default.findOne({ userId: user._id });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile: profileData
        });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
}));
const aiService_1 = require("../services/aiService");
// ... (imports)
// @desc    Create/Update Mentor Profile
// @route   POST /api/users/mentor-profile
// @access  Private
exports.updateMentorProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bio, skills, yearsExperience, languages, availability } = req.body;
    const user = yield User_1.default.findById(req.user._id);
    if (!user || user.role !== 'mentor') {
        res.status(400);
        throw new Error('User not authorized as mentor');
    }
    // AI Content Moderation
    if (bio) {
        const moderationResult = yield (0, aiService_1.moderateContent)(bio);
        if (moderationResult && moderationResult.flagged) {
            res.status(400);
            throw new Error(`Profile update rejected: ${moderationResult.reason}`);
        }
    }
    // Generate embedding text
    const embeddingText = `Bio: ${bio}. Skills: ${skills.join(', ')}. Experience: ${yearsExperience} years. Languages: ${languages.join(', ')}.`;
    const embedding = yield (0, aiService_1.generateEmbedding)(embeddingText);
    let profile = yield MentorProfile_1.default.findOne({ userId: req.user._id });
    if (profile) {
        profile.bio = bio || profile.bio;
        profile.skills = skills || profile.skills;
        profile.yearsExperience = yearsExperience || profile.yearsExperience;
        profile.languages = languages || profile.languages;
        profile.availability = availability || profile.availability;
        if (embedding)
            profile.embedding = embedding;
        yield profile.save();
    }
    else {
        profile = yield MentorProfile_1.default.create({
            userId: req.user._id,
            bio,
            skills,
            yearsExperience,
            languages,
            availability,
            embedding: embedding || []
        });
        user.profile = profile._id;
        yield user.save();
    }
    res.json(profile);
}));
// @desc    Create/Update Mentee Profile
// @route   POST /api/users/mentee-profile
// @access  Private
exports.updateMenteeProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { interests, skillLevel, learningGoals, preferredTimes } = req.body;
    const user = yield User_1.default.findById(req.user._id);
    if (!user || user.role !== 'mentee') {
        res.status(400);
        throw new Error('User not authorized as mentee');
    }
    // AI Content Moderation
    const contentToCheck = `${interests.join(' ')} ${learningGoals.join(' ')}`;
    const moderationResult = yield (0, aiService_1.moderateContent)(contentToCheck);
    if (moderationResult && moderationResult.flagged) {
        res.status(400);
        throw new Error(`Profile update rejected: ${moderationResult.reason}`);
    }
    // Generate embedding text
    const embeddingText = `Interests: ${interests.join(', ')}. Skill Level: ${skillLevel}. Goals: ${learningGoals.join(', ')}.`;
    const embedding = yield (0, aiService_1.generateEmbedding)(embeddingText);
    let profile = yield MenteeProfile_1.default.findOne({ userId: req.user._id });
    if (profile) {
        profile.interests = interests || profile.interests;
        profile.skillLevel = skillLevel || profile.skillLevel;
        profile.learningGoals = learningGoals || profile.learningGoals;
        profile.preferredTimes = preferredTimes || profile.preferredTimes;
        if (embedding)
            profile.embedding = embedding;
        yield profile.save();
    }
    else {
        profile = yield MenteeProfile_1.default.create({
            userId: req.user._id,
            interests,
            skillLevel,
            learningGoals,
            preferredTimes,
            embedding: embedding || []
        });
        user.profile = profile._id;
        yield user.save();
    }
    res.json(profile);
}));
// @desc    Update user profile (unified)
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findById(req.user._id);
    if (user) {
        user.name = req.body.name || user.name;
        user.avatarUrl = req.body.avatarUrl || user.avatarUrl;
        if (req.body.password) {
            user.passwordHash = req.body.password;
        }
        const updatedUser = yield user.save();
        // Update specific profile if data provided
        let profileData = null;
        if (user.role === 'mentor') {
            const { bio, skills, yearsExperience, languages, availability } = req.body;
            let profile = yield MentorProfile_1.default.findOne({ userId: user._id });
            if (profile) {
                if (bio)
                    profile.bio = bio;
                if (skills)
                    profile.skills = skills;
                if (yearsExperience)
                    profile.yearsExperience = yearsExperience;
                if (languages)
                    profile.languages = languages;
                if (availability)
                    profile.availability = availability;
                yield profile.save();
                profileData = profile;
            }
        }
        else if (user.role === 'mentee') {
            const { interests, skillLevel, learningGoals, preferredTimes } = req.body;
            let profile = yield MenteeProfile_1.default.findOne({ userId: user._id });
            if (profile) {
                if (interests)
                    profile.interests = interests;
                if (skillLevel)
                    profile.skillLevel = skillLevel;
                if (learningGoals)
                    profile.learningGoals = learningGoals;
                if (preferredTimes)
                    profile.preferredTimes = preferredTimes;
                yield profile.save();
                profileData = profile;
            }
        }
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatarUrl: updatedUser.avatarUrl,
            token: (0, generateToken_1.default)(updatedUser._id.toString()),
            profile: profileData
        });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
}));
