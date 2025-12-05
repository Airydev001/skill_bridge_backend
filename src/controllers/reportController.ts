import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Report from '../models/Report';
import User from '../models/User';

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
export const createReport = asyncHandler(async (req: Request, res: Response) => {
    const { reportedId, reason, description } = req.body;

    const reportedUser = await User.findById(reportedId);
    if (!reportedUser) {
        res.status(404);
        throw new Error('User to report not found');
    }

    const report = await Report.create({
        reporterId: req.user._id,
        reportedId,
        reason,
        description,
        status: 'pending'
    });

    res.status(201).json(report);
});

// @desc    Get all reports (Admin only)
// @route   GET /api/reports
// @access  Private/Admin
export const getReports = asyncHandler(async (req: Request, res: Response) => {
    const reports = await Report.find({})
        .populate('reporterId', 'name email')
        .populate('reportedId', 'name email role')
        .sort({ createdAt: -1 });

    res.json(reports);
});

// @desc    Update report status (Admin only)
// @route   PUT /api/reports/:id
// @access  Private/Admin
export const updateReportStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);

    if (report) {
        report.status = status;
        await report.save();
        res.json(report);
    } else {
        res.status(404);
        throw new Error('Report not found');
    }
});
