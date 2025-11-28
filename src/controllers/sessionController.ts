import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Session from '../models/Session';
import { v4 as uuidv4 } from 'uuid';

import { sendSessionReminder } from '../services/emailService';
import { checkAndAwardBadges } from '../services/gamificationService';
import User from '../models/User';

// @desc    Create new session
// @route   POST /api/sessions
// @access  Private
export const createSession = asyncHandler(async (req: Request, res: Response) => {
    const { mentorId, startAt, agenda } = req.body;

    const start = new Date(startAt);
    const end = new Date(start.getTime() + 20 * 60000); // 20 minutes

    const session = await Session.create({
        mentorId,
        menteeId: req.user._id,
        startAt: start,
        endAt: end,
        agenda,
        webrtcRoomId: uuidv4()
    });

    // Send response immediately to avoid blocking on email service
    res.status(201).json(session);

    // Send Email Notification asynchronously
    const sendEmails = async () => {
        try {
            const mentee = req.user;
            const mentor = await User.findById(mentorId);

            if (mentee) {
                await sendSessionReminder(session, mentee).catch(err => console.error('Error sending mentee reminder:', err));
            }
            if (mentor) {
                await sendSessionReminder(session, mentor).catch(err => console.error('Error sending mentor reminder:', err));
            }
        } catch (error) {
            console.error('Error in background email process:', error);
        }
    };

    // Trigger background email sending
    setImmediate(() => {
        sendEmails();
    });
});

// @desc    Get user sessions
// @route   GET /api/sessions
// @access  Private
export const getSessions = asyncHandler(async (req: Request, res: Response) => {
    const sessions = await Session.find({
        $or: [{ mentorId: req.user._id }, { menteeId: req.user._id }]
    }).populate('mentorId', 'name avatarUrl').populate('menteeId', 'name avatarUrl');

    console.log(`[getSessions] Found ${sessions.length} total sessions for user ${req.user._id}`);

    // Filter out sessions with missing data
    const validSessions = sessions.filter(session => session.mentorId && session.menteeId);

    console.log(`[getSessions] Returning ${validSessions.length} valid sessions after filtering`);

    res.json(validSessions);
});

// @desc    Update session status
// @route   PATCH /api/sessions/:id
// @access  Private
export const updateSession = asyncHandler(async (req: Request, res: Response) => {
    const session = await Session.findById(req.params.id);

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

    await session.save();

    // Check for gamification if session completed
    if (oldStatus !== 'completed' && session.status === 'completed') {
        await checkAndAwardBadges(session.mentorId.toString());
        await checkAndAwardBadges(session.menteeId.toString());
    }

    res.json(session);
});

// @desc    Get session by ID
// @route   GET /api/sessions/:id
// @access  Private
export const getSessionById = asyncHandler(async (req: Request, res: Response) => {
    const session = await Session.findById(req.params.id)
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
    } else {
        res.status(404);
        throw new Error('Session not found');
    }
});
