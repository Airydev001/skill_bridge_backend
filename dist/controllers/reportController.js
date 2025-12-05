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
exports.updateReportStatus = exports.getReports = exports.createReport = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Report_1 = __importDefault(require("../models/Report"));
const User_1 = __importDefault(require("../models/User"));
// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
exports.createReport = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reportedId, reason, description } = req.body;
    const reportedUser = yield User_1.default.findById(reportedId);
    if (!reportedUser) {
        res.status(404);
        throw new Error('User to report not found');
    }
    const report = yield Report_1.default.create({
        reporterId: req.user._id,
        reportedId,
        reason,
        description,
        status: 'pending'
    });
    res.status(201).json(report);
}));
// @desc    Get all reports (Admin only)
// @route   GET /api/reports
// @access  Private/Admin
exports.getReports = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reports = yield Report_1.default.find({})
        .populate('reporterId', 'name email')
        .populate('reportedId', 'name email role')
        .sort({ createdAt: -1 });
    res.json(reports);
}));
// @desc    Update report status (Admin only)
// @route   PUT /api/reports/:id
// @access  Private/Admin
exports.updateReportStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.body;
    const report = yield Report_1.default.findById(req.params.id);
    if (report) {
        report.status = status;
        yield report.save();
        res.json(report);
    }
    else {
        res.status(404);
        throw new Error('Report not found');
    }
}));
