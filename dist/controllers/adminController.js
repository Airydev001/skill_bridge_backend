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
exports.updateReportStatus = exports.getReports = exports.getAllUsers = exports.getAdminStats = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../models/User"));
const Session_1 = __importDefault(require("../models/Session"));
const Report_1 = __importDefault(require("../models/Report"));
// @desc    Get admin stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const totalUsers = yield User_1.default.countDocuments();
    const totalMentors = yield User_1.default.countDocuments({ role: 'mentor' });
    const totalMentees = yield User_1.default.countDocuments({ role: 'mentee' });
    const totalSessions = yield Session_1.default.countDocuments();
    const completedSessions = yield Session_1.default.countDocuments({ status: 'completed' });
    // Calculate Donated Hours (20 mins per session)
    const totalDonatedHours = (completedSessions * 20) / 60;
    // Active Users (logged in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = yield User_1.default.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } });
    const pendingReports = yield Report_1.default.countDocuments({ status: 'pending' });
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
}));
// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User_1.default.find({}).select('-passwordHash').sort('-createdAt');
    res.json(users);
}));
// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getReports = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reports = yield Report_1.default.find({})
        .populate('reporterId', 'name email')
        .populate('reportedId', 'name email')
        .sort('-createdAt');
    res.json(reports);
}));
// @desc    Update report status
// @route   PATCH /api/admin/reports/:id
// @access  Private/Admin
exports.updateReportStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.body;
    const report = yield Report_1.default.findById(req.params.id);
    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }
    report.status = status;
    yield report.save();
    res.json(report);
}));
