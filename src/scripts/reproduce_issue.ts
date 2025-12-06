import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import MenteeProfile from '../models/MenteeProfile';
import connectDB from '../config/db';

dotenv.config();

const reproduceIssue = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        // 1. Create a test user
        const email = `test_mentee_${Date.now()}@example.com`;
        const user = await User.create({
            name: 'Test Mentee',
            email,
            passwordHash: 'password',
            role: 'mentee'
        });
        console.log(`Created user: ${user._id}`);

        // 2. Create a profile (simulating the controller logic)
        let profile = await MenteeProfile.create({
            userId: user._id,
            interests: ['coding'],
            skillLevel: 'beginner',
            learningGoals: ['learn react'],
            preferredTimes: ['morning'],
            embedding: []
        });
        console.log(`Created profile with interests: ${profile.interests}`);

        // 3. Update interests (simulating the controller logic)
        const newInterests = ['coding', 'ai', 'web'];

        // Fetch again to be sure
        profile = await MenteeProfile.findOne({ userId: user._id }) as any;

        if (profile) {
            console.log('Updating interests...');
            // Mimic controller logic
            if (newInterests) profile.interests = newInterests;
            await profile.save();
            console.log('Saved profile.');
        }

        // 4. Verify
        const updatedProfile = await MenteeProfile.findOne({ userId: user._id });
        console.log(`Updated profile interests: ${updatedProfile?.interests}`);

        if (updatedProfile?.interests.length === 3 && updatedProfile.interests.includes('ai')) {
            console.log('SUCCESS: Interests updated correctly.');
        } else {
            console.error('FAILURE: Interests did not update correctly.');
        }

        // Cleanup
        await MenteeProfile.deleteOne({ _id: profile?._id });
        await User.deleteOne({ _id: user._id });
        console.log('Cleanup done.');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

reproduceIssue();
