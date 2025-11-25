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
exports.resetPassword = exports.forgotPassword = exports.registerUser = exports.authUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../models/User"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.authUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield User_1.default.findOne({ email });
    if (user && (yield user.matchPassword(password))) {
        user.lastLogin = new Date();
        yield user.save();
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: (0, generateToken_1.default)(user._id.toString()),
        });
    }
    else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
}));
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role } = req.body;
    const userExists = yield User_1.default.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    const user = yield User_1.default.create({
        name,
        email,
        passwordHash: password,
        role: role || 'mentee',
    });
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: (0, generateToken_1.default)(user._id.toString()),
        });
    }
    else {
        res.status(400);
        throw new Error('Invalid user data');
    }
}));
// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield User_1.default.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    // Generate reset token (mock for now, in real app send email)
    const resetToken = (0, generateToken_1.default)(user._id.toString());
    // In a real app, you would save a hashed version of this token to the user document
    // and send an email with a link like: http://localhost:5173/reset-password?token=${resetToken}
    console.log(`Reset token for ${email}: ${resetToken}`);
    res.json({ message: 'Password reset email sent (check console for token)', token: resetToken });
}));
// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, password } = req.body;
    // Verify token
    // In a real app, verify against the hashed token in DB
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
    const user = yield User_1.default.findById(decoded.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    user.passwordHash = password;
    yield user.save();
    res.json({ message: 'Password updated successfully' });
}));
