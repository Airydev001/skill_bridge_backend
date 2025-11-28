import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:4000/api';

const runVerification = async () => {
    try {
        console.log('Starting Booking Verification...');

        // 1. Register/Login Mentee
        const menteeEmail = `testmentee_${Date.now()}@example.com`;
        const password = 'password123';

        console.log('1. Registering Mentee...');
        let token;
        let menteeId;

        try {
            const registerRes = await axios.post(`${API_URL}/auth/register`, {
                name: 'Test Mentee',
                email: menteeEmail,
                password,
                role: 'mentee'
            });
            token = registerRes.data.token;
            menteeId = registerRes.data._id;
            console.log('   Mentee registered:', menteeId);
        } catch (e: any) {
            console.error('   Registration failed:', e.response?.data || e.message);
            process.exit(1);
        }

        // 2. Find a Mentor
        console.log('2. Finding a Mentor...');
        let mentorId;
        try {
            const mentorsRes = await axios.get(`${API_URL}/mentors`);
            if (mentorsRes.data.length === 0) {
                console.error('   No mentors found. Please seed the database.');
                process.exit(1);
            }
            mentorId = mentorsRes.data[0].userId._id; // Assuming structure
            // If the first one doesn't have a profile, we might need to look deeper, 
            // but getMentors returns MentorProfiles populated with userId.
            // Wait, getMentors returns MentorProfile documents.
            // So mentorsRes.data[0]._id is the MentorProfile ID.
            // But createSession expects `mentorId` to be the User ID of the mentor?
            // Let's check sessionController.ts:
            // const { mentorId, startAt, agenda } = req.body;
            // const session = await Session.create({ mentorId, ... });
            // Session model: mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
            // So we need the User ID of the mentor.

            // getMentors returns: MentorProfile.find().populate('userId', 'name avatarUrl')
            // So mentorsRes.data[0].userId is an object {_id, name, avatarUrl}
            mentorId = mentorsRes.data[0].userId._id;

            console.log('   Mentor found:', mentorId);
        } catch (e: any) {
            console.error('   Failed to fetch mentors:', e.response?.data || e.message);
            process.exit(1);
        }

        // 3. Get Available Slots
        console.log('3. Getting Available Slots...');
        let slotToBook;
        try {
            const today = new Date().toISOString().split('T')[0];
            // We need to find a day that matches the mentor's availability.
            // The seed script adds availability for Mon-Fri.
            // Let's just try "today". If it's weekend, this might fail to find slots.
            // For verification, let's force a known available day if today is empty?
            // Or just try the next 7 days until we find slots.

            for (let i = 0; i < 7; i++) {
                const d = new Date();
                d.setDate(d.getDate() + i);
                const dateStr = d.toISOString().split('T')[0];

                // We need the MentorProfile ID for the route /api/mentors/:id/slots
                // The route expects the MentorProfile ID, not User ID.
                // Let's get the MentorProfile ID from step 2.
                const mentorProfileId = (await axios.get(`${API_URL}/mentors`)).data[0]._id;

                const slotsRes = await axios.get(`${API_URL}/mentors/${mentorProfileId}/slots?date=${dateStr}`);
                if (slotsRes.data.length > 0) {
                    slotToBook = slotsRes.data[0];
                    console.log(`   Found slot on ${dateStr}:`, slotToBook);
                    break;
                }
            }

            if (!slotToBook) {
                console.error('   No slots found for the next 7 days.');
                process.exit(1);
            }
        } catch (e: any) {
            console.error('   Failed to fetch slots:', e.response?.data || e.message);
            process.exit(1);
        }

        // 4. Book Session
        console.log('4. Booking Session...');
        try {
            const bookingRes = await axios.post(`${API_URL}/sessions`, {
                mentorId: mentorId, // User ID
                startAt: slotToBook,
                agenda: 'Verification Test Session'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('   Session booked successfully:', bookingRes.data._id);
            console.log('   Status:', bookingRes.data.status);

            if (bookingRes.data.status !== 'scheduled') {
                throw new Error('Session status is not scheduled');
            }
        } catch (e: any) {
            console.error('   Booking failed:', e.response?.data || e.message);
            process.exit(1);
        }

        console.log('VERIFICATION SUCCESSFUL: Booking flow is working.');
        process.exit(0);

    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

runVerification();
