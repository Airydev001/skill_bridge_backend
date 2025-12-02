import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import MentorProfile from '../models/MentorProfile';
import User from '../models/User';
import Session from '../models/Session';

// @desc    Get mentor availability slots
// @route   GET /api/mentors/:id/slots
// @access  Public
export const getMentorSlots = asyncHandler(async (req: Request, res: Response) => {
    const { date } = req.query;
    const mentorId = req.params.id;

    if (!date) {
        res.status(400);
        throw new Error('Date parameter is required (YYYY-MM-DD)');
    }

    const mentor = await MentorProfile.findById(mentorId);
    if (!mentor) {
        res.status(404);
        throw new Error('Mentor not found');
    }

    // 1. Determine day of week (e.g., "Monday")
    const queryDate = new Date(date as string);
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

    const existingSessions = await Session.find({
        mentorId: mentor.userId, // Note: Session uses User ID, MentorProfile has userId ref
        startAt: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'cancelled' }
    });

    const bookedTimes = existingSessions.map(s => s.startAt.toISOString());

    // 5. Filter out booked slots
    // 5. Filter out booked slots AND past slots
    const now = new Date();
    const availableSlots = potentialSlots.filter(slot => {
        const slotTime = new Date(slot);
        const isBooked = bookedTimes.includes(slot);
        const isPast = slotTime < now;
        return !isBooked && !isPast;
    });

    res.json(availableSlots);
});

// @desc    Get all mentors with filters
// @route   GET /api/mentors
// @access  Public
export const getMentors = asyncHandler(async (req: Request, res: Response) => {
    const { skill, language, name } = req.query;

    let query: any = {};

    if (skill) {
        query.skills = { $in: [skill] };
    }

    if (language) {
        query.languages = { $in: [language] };
    }

    let mentors = await MentorProfile.find(query).populate('userId', 'name avatarUrl');

    // Filter out mentors with missing user data (e.g. deleted users)
    mentors = mentors.filter((mentor: any) => mentor.userId);

    if (name) {
        mentors = mentors.filter((mentor: any) =>
            mentor.userId.name.toLowerCase().includes((name as string).toLowerCase())
        );
    }

    res.json(mentors);
});

// @desc    Get mentor by ID
// @route   GET /api/mentors/:id
// @access  Public
export const getMentorById = asyncHandler(async (req: Request, res: Response) => {
    const mentor = await MentorProfile.findById(req.params.id).populate('userId', 'name avatarUrl');

    if (mentor) {
        res.json(mentor);
    } else {
        res.status(404);
        throw new Error('Mentor not found');
    }
});
