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
exports.updateMenteeProfile = exports.updateMentorProfile = exports.getUserProfile = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../models/User"));
const MentorProfile_1 = __importDefault(require("../models/MentorProfile"));
const MenteeProfile_1 = __importDefault(require("../models/MenteeProfile"));
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
    let profile = yield MentorProfile_1.default.findOne({ userId: req.user._id });
    if (profile) {
        profile.bio = bio || profile.bio;
        profile.skills = skills || profile.skills;
        profile.yearsExperience = yearsExperience || profile.yearsExperience;
        profile.languages = languages || profile.languages;
        profile.availability = availability || profile.availability;
        yield profile.save();
    }
    else {
        profile = yield MentorProfile_1.default.create({
            userId: req.user._id,
            bio,
            skills,
            yearsExperience,
            languages,
            availability
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
    let profile = yield MenteeProfile_1.default.findOne({ userId: req.user._id });
    if (profile) {
        profile.interests = interests || profile.interests;
        profile.skillLevel = skillLevel || profile.skillLevel;
        profile.learningGoals = learningGoals || profile.learningGoals;
        profile.preferredTimes = preferredTimes || profile.preferredTimes;
        yield profile.save();
    }
    else {
        profile = yield MenteeProfile_1.default.create({
            userId: req.user._id,
            interests,
            skillLevel,
            learningGoals,
            preferredTimes
        });
        user.profile = profile._id;
        yield user.save();
    }
    res.json(profile);
}));
