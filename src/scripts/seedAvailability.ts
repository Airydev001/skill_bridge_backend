import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MentorProfile from '../models/MentorProfile';

dotenv.config();

const seedAvailability = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const mentors = await MentorProfile.find({});

        if (mentors.length === 0) {
            console.log('No mentors found');
            process.exit(1);
        }

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

        for (const mentor of mentors) {
            mentor.availability = days.map(day => ({
                day,
                slots,
                timezone: 'UTC'
            }));
            await mentor.save();
            console.log(`Updated availability for mentor: ${mentor._id}`);
        }

        console.log('Seeding complete');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding availability:', error);
        process.exit(1);
    }
};

seedAvailability();
