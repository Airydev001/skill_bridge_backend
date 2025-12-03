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
exports.forceSessionSummary = exports.getSessionById = exports.updateSession = exports.getSessions = exports.createSession = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Session_1 = __importDefault(require("../models/Session"));
const uuid_1 = require("uuid");
const emailService_1 = require("../services/emailService");
const gamificationService_1 = require("../services/gamificationService");
const User_1 = __importDefault(require("../models/User"));
const aiService_1 = require("../services/aiService");
const LearningPath_1 = __importDefault(require("../models/LearningPath"));
// @desc    Create new session
// @route   POST /api/sessions
// @access  Private
exports.createSession = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mentorId, startAt, agenda } = req.body;
    const start = new Date(startAt);
    const end = new Date(start.getTime() + 20 * 60000); // 20 minutes
    const session = yield Session_1.default.create({
        mentorId,
        menteeId: req.user._id,
        startAt: start,
        endAt: end,
        agenda,
        webrtcRoomId: (0, uuid_1.v4)()
    });
    // Send response immediately to avoid blocking on email service
    res.status(201).json(session);
    // Send Email Notification asynchronously
    const sendEmails = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const mentee = req.user;
            const mentor = yield User_1.default.findById(mentorId);
            if (mentee) {
                yield (0, emailService_1.sendSessionReminder)(session, mentee).catch(err => console.error('Error sending mentee reminder:', err));
            }
            if (mentor) {
                yield (0, emailService_1.sendSessionReminder)(session, mentor).catch(err => console.error('Error sending mentor reminder:', err));
            }
        }
        catch (error) {
            console.error('Error in background email process:', error);
        }
    });
    // Trigger background email sending
    setImmediate(() => {
        sendEmails();
    });
}));
// @desc    Get user sessions
// @route   GET /api/sessions
// @access  Private
exports.getSessions = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sessions = yield Session_1.default.find({
        $or: [{ mentorId: req.user._id }, { menteeId: req.user._id }]
    }).populate('mentorId', 'name avatarUrl').populate('menteeId', 'name avatarUrl');
    console.log(`[getSessions] Found ${sessions.length} total sessions for user ${req.user._id}`);
    // Filter out sessions with missing data
    const validSessions = sessions.filter(session => session.mentorId && session.menteeId);
    console.log(`[getSessions] Returning ${validSessions.length} valid sessions after filtering`);
    res.json(validSessions);
}));
// @desc    Update session status
// @route   PATCH /api/sessions/:id
// @access  Private
exports.updateSession = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield Session_1.default.findById(req.params.id);
    if (!session) {
        res.status(404);
        throw new Error('Session not found');
    }
    if (session.mentorId.toString() !== req.user._id.toString() && session.menteeId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }
    const oldStatus = session.status;
    session.status = req.body.status || session.status;
    session.rating = req.body.rating || session.rating;
    session.notes = req.body.notes || session.notes;
    yield session.save();
    // Check for gamification if session completed
    if (oldStatus !== 'completed' && session.status === 'completed') {
        console.log(`[updateSession] Session ${session._id} completed. Triggering post-completion tasks.`);
        yield (0, gamificationService_1.checkAndAwardBadges)(session.mentorId.toString());
        yield (0, gamificationService_1.checkAndAwardBadges)(session.menteeId.toString());
        // Generate AI Summary
        try {
            console.log(`[updateSession] Generating AI summary for session ${session._id}...`);
            const summary = yield (0, aiService_1.generateSessionSummary)(session);
            console.log(`[updateSession] AI Summary result: ${summary ? 'Success' : 'Failed (null)'}`);
            if (summary) {
                session.aiSummary = summary;
                yield session.save();
                console.log(`[updateSession] AI summary saved to session.`);
                // Update Learning Path Progress
                const learningPath = yield LearningPath_1.default.findOne({ menteeId: session.menteeId });
                if (learningPath) {
                    console.log(`[updateSession] Updating learning path for mentee ${session.menteeId}...`);
                    const updatedPathData = yield (0, aiService_1.updateLearningPathProgress)(learningPath.toObject(), summary);
                    if (updatedPathData) {
                        yield LearningPath_1.default.findByIdAndUpdate(learningPath._id, updatedPathData);
                        console.log(`[updateSession] Learning path updated.`);
                    }
                }
                else {
                    console.log(`[updateSession] No learning path found for mentee ${session.menteeId}.`);
                }
            }
        }
        catch (error) {
            console.error('[updateSession] Error generating summary or updating learning path:', error);
        }
    }
    else {
        console.log(`[updateSession] Status change ${oldStatus} -> ${session.status} did not trigger completion tasks.`);
    }
    res.json(session);
}));
// @desc    Get session by ID
// @route   GET /api/sessions/:id
// @access  Private
exports.getSessionById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield Session_1.default.findById(req.params.id)
        .populate('mentorId', 'name avatarUrl')
        .populate('menteeId', 'name avatarUrl');
    if (session) {
        // Check if user is part of the session
        if (session.mentorId._id.toString() !== req.user._id.toString() &&
            session.menteeId._id.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }
        res.json(session);
    }
    else {
        res.status(404);
        throw new Error('Session not found');
    }
}));
// @desc    Force generate AI summary for a session
// @route   POST /api/sessions/:id/analyze
// @access  Private
exports.forceSessionSummary = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield Session_1.default.findById(req.params.id);
    if (!session) {
        res.status(404);
        throw new Error('Session not found');
    }
    if (session.mentorId.toString() !== req.user._id.toString() && session.menteeId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }
    console.log(`[forceSessionSummary] Manually triggering AI summary for session ${session._id}...`);
    try {
        const summary = yield (0, aiService_1.generateSessionSummary)(session);
        console.log(`[forceSessionSummary] AI Summary result: ${summary ? 'Success' : 'Failed (null)'}`);
        if (summary) {
            session.aiSummary = summary;
            yield session.save();
            // Update Learning Path Progress
            const learningPath = yield LearningPath_1.default.findOne({ menteeId: session.menteeId });
            if (learningPath) {
                const updatedPathData = yield (0, aiService_1.updateLearningPathProgress)(learningPath.toObject(), summary);
                if (updatedPathData) {
                    yield LearningPath_1.default.findByIdAndUpdate(learningPath._id, updatedPathData);
                }
            }
            res.json({ message: 'Summary generated successfully', summary });
        }
        else {
            res.status(500).json({ message: 'Failed to generate summary. Check server logs for details.' });
        }
    }
    catch (error) {
        console.error('[forceSessionSummary] Error:', error);
        res.status(500).json({ message: 'Error generating summary', error: error.message });
    }
}));
