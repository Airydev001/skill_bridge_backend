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
exports.getMentorById = exports.getMentors = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const MentorProfile_1 = __importDefault(require("../models/MentorProfile"));
// @desc    Get all mentors with filters
// @route   GET /api/mentors
// @access  Public
exports.getMentors = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { skill, language, name } = req.query;
    let query = {};
    if (skill) {
        query.skills = { $in: [skill] };
    }
    if (language) {
        query.languages = { $in: [language] };
    }
    let mentors = yield MentorProfile_1.default.find(query).populate('userId', 'name avatarUrl');
    // Filter out mentors with missing user data (e.g. deleted users)
    mentors = mentors.filter((mentor) => mentor.userId);
    if (name) {
        mentors = mentors.filter((mentor) => mentor.userId.name.toLowerCase().includes(name.toLowerCase()));
    }
    res.json(mentors);
}));
// @desc    Get mentor by ID
// @route   GET /api/mentors/:id
// @access  Public
exports.getMentorById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const mentor = yield MentorProfile_1.default.findById(req.params.id).populate('userId', 'name avatarUrl');
    if (mentor) {
        res.json(mentor);
    }
    else {
        res.status(404);
        throw new Error('Mentor not found');
    }
}));
