import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import jwt from 'jsonwebtoken';
import { sendPasswordResetEmail } from '../services/emailService';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        user.lastLogin = new Date();
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id.toString()),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
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
            token: generateToken(user._id.toString()),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Generate reset token
    const resetToken = generateToken(user._id.toString());

    // Send email
    try {
        await sendPasswordResetEmail(user, resetToken);
        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        res.status(500);
        throw new Error('Email could not be sent');
    }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;

    // Verify token
    // In a real app, verify against the hashed token in DB
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    const user = await User.findById(decoded.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.passwordHash = password;
    await user.save();

    res.json({ message: 'Password updated successfully' });
});
