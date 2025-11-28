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
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const API_URL = 'http://localhost:4000/api';
const runVerification = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        console.log('Starting Booking Verification...');
        // 1. Register/Login Mentee
        const menteeEmail = `testmentee_${Date.now()}@example.com`;
        const password = 'password123';
        console.log('1. Registering Mentee...');
        let token;
        let menteeId;
        try {
            const registerRes = yield axios_1.default.post(`${API_URL}/auth/register`, {
                name: 'Test Mentee',
                email: menteeEmail,
                password,
                role: 'mentee'
            });
            token = registerRes.data.token;
            menteeId = registerRes.data._id;
            console.log('   Mentee registered:', menteeId);
        }
        catch (e) {
            console.error('   Registration failed:', ((_a = e.response) === null || _a === void 0 ? void 0 : _a.data) || e.message);
            process.exit(1);
        }
        // 2. Find a Mentor
        console.log('2. Finding a Mentor...');
        let mentorId;
        try {
            const mentorsRes = yield axios_1.default.get(`${API_URL}/mentors`);
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
        }
        catch (e) {
            console.error('   Failed to fetch mentors:', ((_b = e.response) === null || _b === void 0 ? void 0 : _b.data) || e.message);
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
                const mentorProfileId = (yield axios_1.default.get(`${API_URL}/mentors`)).data[0]._id;
                const slotsRes = yield axios_1.default.get(`${API_URL}/mentors/${mentorProfileId}/slots?date=${dateStr}`);
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
        }
        catch (e) {
            console.error('   Failed to fetch slots:', ((_c = e.response) === null || _c === void 0 ? void 0 : _c.data) || e.message);
            process.exit(1);
        }
        // 4. Book Session
        console.log('4. Booking Session...');
        try {
            const bookingRes = yield axios_1.default.post(`${API_URL}/sessions`, {
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
        }
        catch (e) {
            console.error('   Booking failed:', ((_d = e.response) === null || _d === void 0 ? void 0 : _d.data) || e.message);
            process.exit(1);
        }
        console.log('VERIFICATION SUCCESSFUL: Booking flow is working.');
        process.exit(0);
    }
    catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
});
runVerification();
