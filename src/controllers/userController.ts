import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import MentorProfile from '../models/MentorProfile';
import MenteeProfile from '../models/MenteeProfile';
import generateToken from '../utils/generateToken';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user._id);

    if (user) {
        let profileData = null;
        if (user.role === 'mentor') {
            profileData = await MentorProfile.findOne({ userId: user._id });
        } else if (user.role === 'mentee') {
            profileData = await MenteeProfile.findOne({ userId: user._id });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile: profileData
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Create/Update Mentor Profile
// @route   POST /api/users/mentor-profile
// @access  Private
export const updateMentorProfile = asyncHandler(async (req: Request, res: Response) => {
    const { bio, skills, yearsExperience, languages, availability } = req.body;

    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'mentor') {
        res.status(400);
        throw new Error('User not authorized as mentor');
    }

    let profile = await MentorProfile.findOne({ userId: req.user._id });

    if (profile) {
        profile.bio = bio || profile.bio;
        profile.skills = skills || profile.skills;
        profile.yearsExperience = yearsExperience || profile.yearsExperience;
        profile.languages = languages || profile.languages;
        profile.availability = availability || profile.availability;
        await profile.save();
    } else {
        profile = await MentorProfile.create({
            userId: req.user._id,
            bio,
            skills,
            yearsExperience,
            languages,
            availability
        });
        user.profile = profile._id as any;
        await user.save();
    }

    res.json(profile);
});

// @desc    Create/Update Mentee Profile
// @route   POST /api/users/mentee-profile
// @access  Private
export const updateMenteeProfile = asyncHandler(async (req: Request, res: Response) => {
    const { interests, skillLevel, learningGoals, preferredTimes } = req.body;

    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'mentee') {
        res.status(400);
        throw new Error('User not authorized as mentee');
    }

    let profile = await MenteeProfile.findOne({ userId: req.user._id });

    if (profile) {
        profile.interests = interests || profile.interests;
        profile.skillLevel = skillLevel || profile.skillLevel;
        profile.learningGoals = learningGoals || profile.learningGoals;
        profile.preferredTimes = preferredTimes || profile.preferredTimes;
        await profile.save();
    } else {
        profile = await MenteeProfile.create({
            userId: req.user._id,
            interests,
            skillLevel,
            learningGoals,
            preferredTimes
        });
        user.profile = profile._id as any;
        await user.save();
    }

    res.json(profile);
});
// @desc    Update user profile (unified)
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.avatarUrl = req.body.avatarUrl || user.avatarUrl;

        if (req.body.password) {
            user.passwordHash = req.body.password;
        }

        const updatedUser = await user.save();

        // Update specific profile if data provided
        let profileData = null;
        if (user.role === 'mentor') {
            const { bio, skills, yearsExperience, languages, availability } = req.body;
            let profile = await MentorProfile.findOne({ userId: user._id });
            if (profile) {
                if (bio) profile.bio = bio;
                if (skills) profile.skills = skills;
                if (yearsExperience) profile.yearsExperience = yearsExperience;
                if (languages) profile.languages = languages;
                if (availability) profile.availability = availability;
                await profile.save();
                profileData = profile;
            }
        } else if (user.role === 'mentee') {
            const { interests, skillLevel, learningGoals, preferredTimes } = req.body;
            let profile = await MenteeProfile.findOne({ userId: user._id });
            if (profile) {
                if (interests) profile.interests = interests;
                if (skillLevel) profile.skillLevel = skillLevel;
                if (learningGoals) profile.learningGoals = learningGoals;
                if (preferredTimes) profile.preferredTimes = preferredTimes;
                await profile.save();
                profileData = profile;
            }
        }

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatarUrl: updatedUser.avatarUrl,
            token: generateToken(updatedUser._id.toString()),
            profile: profileData
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});
