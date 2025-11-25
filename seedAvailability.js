const mongoose = require('mongoose');
const MentorProfile = require('./dist/models/MentorProfile').default;
const dotenv = require('dotenv');

dotenv.config();

const seedAvailability = async () => {
    try {
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
                timezone: 'UTC' // Defaulting to UTC for simplicity
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
