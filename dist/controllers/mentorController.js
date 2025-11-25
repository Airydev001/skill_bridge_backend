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
exports.getMentorById = exports.getMentors = exports.getMentorSlots = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const MentorProfile_1 = __importDefault(require("../models/MentorProfile"));
const Session_1 = __importDefault(require("../models/Session"));
// @desc    Get mentor availability slots
// @route   GET /api/mentors/:id/slots
// @access  Public
exports.getMentorSlots = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date } = req.query;
    const mentorId = req.params.id;
    if (!date) {
        res.status(400);
        throw new Error('Date parameter is required (YYYY-MM-DD)');
    }
    const mentor = yield MentorProfile_1.default.findById(mentorId);
    if (!mentor) {
        res.status(404);
        throw new Error('Mentor not found');
    }
    // 1. Determine day of week (e.g., "Monday")
    const queryDate = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[queryDate.getDay()];
    // 2. Find availability for that day
    const dayAvailability = mentor.availability.find(a => a.day === dayName);
    if (!dayAvailability) {
        res.json([]); // No availability for this day
        return;
    }
    // 3. Generate all potential slots as ISO strings
    // Assuming slots are stored as "HH:mm" in UTC
    const potentialSlots = dayAvailability.slots.map(time => {
        return `${date}T${time}:00.000Z`; // Construct ISO UTC string
    });
    // 4. Fetch existing sessions for this mentor on this date
    // We look for sessions that start between the beginning and end of the day
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);
    const existingSessions = yield Session_1.default.find({
        mentorId: mentor.userId, // Note: Session uses User ID, MentorProfile has userId ref
        startAt: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'cancelled' }
    });
    const bookedTimes = existingSessions.map(s => s.startAt.toISOString());
    // 5. Filter out booked slots
    const availableSlots = potentialSlots.filter(slot => !bookedTimes.includes(slot));
    res.json(availableSlots);
}));
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
