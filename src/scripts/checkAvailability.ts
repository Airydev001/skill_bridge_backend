import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MentorProfile from '../models/MentorProfile';

dotenv.config();

const checkAvailability = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('Connected to MongoDB');

        const mentors = await MentorProfile.find({});
        console.log(`Found ${mentors.length} mentors`);

        for (const mentor of mentors) {
            console.log(`Mentor ${mentor._id} availability:`, JSON.stringify(mentor.availability, null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkAvailability();
