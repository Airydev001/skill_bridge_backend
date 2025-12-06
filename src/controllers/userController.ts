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

import { generateEmbedding, moderateContent } from '../services/aiService';

// ... (imports)

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

    // AI Content Moderation
    if (bio) {
        const moderationResult = await moderateContent(bio);
        if (moderationResult && moderationResult.flagged) {
            res.status(400);
            throw new Error(`Profile update rejected: ${moderationResult.reason}`);
        }
    }

    // Generate embedding text
    const embeddingText = `Bio: ${bio}. Skills: ${skills.join(', ')}. Experience: ${yearsExperience} years. Languages: ${languages.join(', ')}.`;
    const embedding = await generateEmbedding(embeddingText);

    let profile = await MentorProfile.findOne({ userId: req.user._id });

    if (profile) {
        profile.bio = bio || profile.bio;
        profile.skills = skills || profile.skills;
        profile.yearsExperience = yearsExperience || profile.yearsExperience;
        profile.languages = languages || profile.languages;
        profile.availability = availability || profile.availability;
        if (embedding) profile.embedding = embedding;
        await profile.save();
    } else {
        profile = await MentorProfile.create({
            userId: req.user._id,
            bio,
            skills,
            yearsExperience,
            languages,
            availability,
            embedding: embedding || []
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

    // AI Content Moderation
    const contentToCheck = `${interests.join(' ')} ${learningGoals.join(' ')}`;
    const moderationResult = await moderateContent(contentToCheck);
    if (moderationResult && moderationResult.flagged) {
        res.status(400);
        throw new Error(`Profile update rejected: ${moderationResult.reason}`);
    }

    // Generate embedding text
    const embeddingText = `Interests: ${interests.join(', ')}. Skill Level: ${skillLevel}. Goals: ${learningGoals.join(', ')}.`;
    const embedding = await generateEmbedding(embeddingText);

    let profile = await MenteeProfile.findOne({ userId: req.user._id });

    if (profile) {
        profile.interests = interests || profile.interests;
        profile.skillLevel = skillLevel || profile.skillLevel;
        profile.learningGoals = learningGoals || profile.learningGoals;
        profile.preferredTimes = preferredTimes || profile.preferredTimes;
        if (embedding) profile.embedding = embedding;
        await profile.save();
    } else {
        profile = await MenteeProfile.create({
            userId: req.user._id,
            interests,
            skillLevel,
            learningGoals,
            preferredTimes,
            embedding: embedding || []
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

            // Create profile if it doesn't exist
            if (!profile) {
                profile = await MentorProfile.create({
                    userId: user._id,
                    bio: bio || '',
                    skills: skills || [],
                    yearsExperience: yearsExperience || 0,
                    languages: languages || [],
                    availability: availability || '',
                    embedding: []
                });
            }

            if (profile) {
                if (bio) profile.bio = bio;
                if (skills) profile.skills = skills;
                if (yearsExperience) profile.yearsExperience = yearsExperience;
                if (languages) profile.languages = languages;
                if (availability) profile.availability = availability;

                // Regenerate embedding if relevant fields are updated
                if (bio || skills || yearsExperience || languages) {
                    const embeddingText = `Bio: ${profile.bio}. Skills: ${profile.skills.join(', ')}. Experience: ${profile.yearsExperience} years. Languages: ${profile.languages.join(', ')}.`;
                    const embedding = await generateEmbedding(embeddingText);
                    if (embedding) profile.embedding = embedding;
                }

                await profile.save();
                profileData = profile;
            }
        } else if (user.role === 'mentee') {
            const { interests, skillLevel, learningGoals, preferredTimes } = req.body;
            let profile = await MenteeProfile.findOne({ userId: user._id });

            // Create profile if it doesn't exist
            if (!profile) {
                profile = await MenteeProfile.create({
                    userId: user._id,
                    interests: interests || [],
                    skillLevel: skillLevel || '',
                    learningGoals: learningGoals || [],
                    preferredTimes: preferredTimes || '',
                    embedding: []
                });
            }

            if (profile) {
                console.log('Updating mentee profile. Body:', JSON.stringify(req.body, null, 2));
                console.log('Current profile interests:', profile.interests);

                if (interests) {
                    console.log('Updating interests to:', interests);
                    profile.interests = interests;
                }
                if (skillLevel) profile.skillLevel = skillLevel;
                if (learningGoals) profile.learningGoals = learningGoals;
                if (preferredTimes) profile.preferredTimes = preferredTimes;

                // Regenerate embedding if relevant fields are updated
                if (interests || skillLevel || learningGoals) {
                    const embeddingText = `Interests: ${profile.interests.join(', ')}. Skill Level: ${profile.skillLevel}. Goals: ${profile.learningGoals.join(', ')}.`;
                    const embedding = await generateEmbedding(embeddingText);
                    if (embedding) profile.embedding = embedding;
                }

                await profile.save();
                console.log('Profile saved. New interests:', profile.interests);
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
