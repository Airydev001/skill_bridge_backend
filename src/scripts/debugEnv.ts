import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../.env');
console.log("Loading .env from:", envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env:", result.error);
}

console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
    console.log("GEMINI_API_KEY length:", process.env.GEMINI_API_KEY.length);
    console.log("GEMINI_API_KEY start:", process.env.GEMINI_API_KEY.substring(0, 5));
} else {
    console.log("GEMINI_API_KEY is undefined or empty");
}
