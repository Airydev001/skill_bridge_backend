import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://127.0.0.1:4000/api';

const runVerification = async () => {
    try {
        console.log('Starting Booking Verification...');

        // Helper for fetch
        const post = async (url: string, data: any, token?: string) => {
            const headers: any = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${API_URL}${url}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`POST ${url} failed: ${res.status} ${text}`);
            }
            return res.json();
        };

        const get = async (url: string, token?: string) => {
            const headers: any = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${API_URL}${url}`, {
                method: 'GET',
                headers
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`GET ${url} failed: ${res.status} ${text}`);
            }
            return res.json();
        };

        // 1. Register/Login Mentee
        const menteeEmail = `testmentee_${Date.now()}@example.com`;
        const password = 'password123';

        console.log('1. Registering Mentee...');
        let token;
        let menteeId;

        try {
            const data = await post('/auth/register', {
                name: 'Test Mentee',
                email: menteeEmail,
                password,
                role: 'mentee'
            });
            token = data.token;
            menteeId = data._id;
            console.log('   Mentee registered:', menteeId);
        } catch (e: any) {
            console.error('   Registration failed:', e);
            process.exit(1);
        }

        // 2. Find a Mentor
        console.log('2. Finding a Mentor...');
        let mentorId;
        try {
            const mentors = await get('/mentors');
            if (mentors.length === 0) {
                console.error('   No mentors found. Please seed the database.');
                process.exit(1);
            }
            // mentors[0] is MentorProfile. userId is populated.
            mentorId = mentors[0].userId._id;
            console.log('   Mentor found:', mentorId);
        } catch (e: any) {
            console.error('   Failed to fetch mentors:', e);
            process.exit(1);
        }

        // 3. Get Available Slots
        console.log('3. Getting Available Slots...');
        let slotToBook;
        try {
            // Find mentor profile ID
            const mentors = await get('/mentors');
            const mentorProfileId = mentors[0]._id;

            for (let i = 0; i < 7; i++) {
                const d = new Date();
                d.setDate(d.getDate() + i);
                const dateStr = d.toISOString().split('T')[0];

                const slots = await get(`/mentors/${mentorProfileId}/slots?date=${dateStr}`);
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
        } catch (e: any) {
            console.error('   Failed to fetch slots:', e);
            process.exit(1);
        }

        // 4. Book Session
        console.log('4. Booking Session...');
        try {
            const booking = await post('/sessions', {
                mentorId: mentorId,
                startAt: slotToBook,
                agenda: 'Verification Test Session'
            }, token);

            console.log('   Session booked successfully:', booking._id);
            console.log('   Status:', booking.status);

            if (booking.status !== 'scheduled') {
                throw new Error('Session status is not scheduled');
            }
        } catch (e: any) {
            console.error('   Booking failed:', e);
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
