import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Session from '../models/Session';

import Report from '../models/Report';

// @desc    Get admin stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
    const totalUsers = await User.countDocuments();
    const totalMentors = await User.countDocuments({ role: 'mentor' });
    const totalMentees = await User.countDocuments({ role: 'mentee' });
    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({ status: 'completed' });

    // Calculate Donated Hours (20 mins per session)
    const totalDonatedHours = (completedSessions * 20) / 60;

    // Active Users (logged in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } });

    const pendingReports = await Report.countDocuments({ status: 'pending' });

    res.json({
        totalUsers,
        totalMentors,
        totalMentees,
        totalSessions,
        completedSessions,
        totalDonatedHours: parseFloat(totalDonatedHours.toFixed(1)),
        activeUsers,
        pendingReports
    });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await User.find({}).select('-passwordHash').sort('-createdAt');
    res.json(users);
});

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getReports = asyncHandler(async (req: Request, res: Response) => {
    const reports = await Report.find({})
        .populate('reporterId', 'name email')
        .populate('reportedId', 'name email')
        .sort('-createdAt');
    res.json(reports);
});

// @desc    Update report status
// @route   PATCH /api/admin/reports/:id
// @access  Private/Admin
export const updateReportStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    report.status = status;
    await report.save();
    res.json(report);
});

// @desc    Verify a mentor
// @route   PUT /api/admin/mentors/:id/verify
// @access  Private/Admin
export const verifyMentor = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);

    if (user && user.role === 'mentor') {
        user.isVerified = !user.isVerified; // Toggle verification
        await user.save();
        res.json({ message: `Mentor ${user.isVerified ? 'verified' : 'unverified'}`, isVerified: user.isVerified });
    } else {
        res.status(404);
        throw new Error('Mentor not found');
    }
});
