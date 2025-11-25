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
exports.getSessionById = exports.updateSession = exports.getSessions = exports.createSession = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Session_1 = __importDefault(require("../models/Session"));
const uuid_1 = require("uuid");
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
    res.status(201).json(session);
}));
// @desc    Get user sessions
// @route   GET /api/sessions
// @access  Private
exports.getSessions = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sessions = yield Session_1.default.find({
        $or: [{ mentorId: req.user._id }, { menteeId: req.user._id }]
    }).populate('mentorId', 'name avatarUrl').populate('menteeId', 'name avatarUrl');
    // Filter out sessions with missing data
    const validSessions = sessions.filter(session => session.mentorId && session.menteeId);
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
    session.status = req.body.status || session.status;
    session.rating = req.body.rating || session.rating;
    session.notes = req.body.notes || session.notes;
    yield session.save();
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
