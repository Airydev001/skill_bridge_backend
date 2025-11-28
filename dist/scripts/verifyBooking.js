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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const API_URL = 'http://127.0.0.1:4000/api';
const runVerification = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Starting Booking Verification...');
        // Helper for fetch
        const post = (url, data, token) => __awaiter(void 0, void 0, void 0, function* () {
            const headers = { 'Content-Type': 'application/json' };
            if (token)
                headers['Authorization'] = `Bearer ${token}`;
            const res = yield fetch(`${API_URL}${url}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const text = yield res.text();
                throw new Error(`POST ${url} failed: ${res.status} ${text}`);
            }
            return res.json();
        });
        const get = (url, token) => __awaiter(void 0, void 0, void 0, function* () {
            const headers = { 'Content-Type': 'application/json' };
            if (token)
                headers['Authorization'] = `Bearer ${token}`;
            const res = yield fetch(`${API_URL}${url}`, {
                method: 'GET',
                headers
            });
            if (!res.ok) {
                const text = yield res.text();
                throw new Error(`GET ${url} failed: ${res.status} ${text}`);
            }
            return res.json();
        });
        // 1. Register/Login Mentee
        const menteeEmail = `testmentee_${Date.now()}@example.com`;
        const password = 'password123';
        console.log('1. Registering Mentee...');
        let token;
        let menteeId;
        try {
            const data = yield post('/auth/register', {
                name: 'Test Mentee',
                email: menteeEmail,
                password,
                role: 'mentee'
            });
            token = data.token;
            menteeId = data._id;
            console.log('   Mentee registered:', menteeId);
        }
        catch (e) {
            console.error('   Registration failed:', e);
            process.exit(1);
        }
        // 2. Find a Mentor
        console.log('2. Finding a Mentor...');
        let mentorId;
        try {
            const mentors = yield get('/mentors');
            if (mentors.length === 0) {
                console.error('   No mentors found. Please seed the database.');
                process.exit(1);
            }
            // mentors[0] is MentorProfile. userId is populated.
            mentorId = mentors[0].userId._id;
            console.log('   Mentor found:', mentorId);
        }
        catch (e) {
            console.error('   Failed to fetch mentors:', e);
            process.exit(1);
        }
        // 3. Get Available Slots
        console.log('3. Getting Available Slots...');
        let slotToBook;
        try {
            // Find mentor profile ID
            const mentors = yield get('/mentors');
            const mentorProfileId = mentors[0]._id;
            for (let i = 0; i < 7; i++) {
                const d = new Date();
                d.setDate(d.getDate() + i);
                const dateStr = d.toISOString().split('T')[0];
                const slots = yield get(`/mentors/${mentorProfileId}/slots?date=${dateStr}`);
                if (slots.length > 0) {
                    slotToBook = slots[0];
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
            console.error('   Failed to fetch slots:', e);
            process.exit(1);
        }
        // 4. Book Session
        console.log('4. Booking Session...');
        try {
            const booking = yield post('/sessions', {
                mentorId: mentorId,
                startAt: slotToBook,
                agenda: 'Verification Test Session'
            }, token);
            console.log('   Session booked successfully:', booking._id);
            console.log('   Status:', booking.status);
            if (booking.status !== 'scheduled') {
                throw new Error('Session status is not scheduled');
            }
        }
        catch (e) {
            console.error('   Booking failed:', e);
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
