import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load env from backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function listModels() {
    try {
        // Access the model via the API directly if SDK doesn't have listModels helper exposed easily on the main class
        // Actually the SDK doesn't expose listModels on the top level class in all versions.
        // Let's try to just use a known working model or try to fetch it via fetch if needed.
        // But wait, the error message said "Call ListModels". 

        // Let's try to just use the model we think works and print it.
        // Actually, let's try to use the `getGenerativeModel` and see if we can probe it.

        // Better approach: Use the API key to make a raw REST call to list models.
        const key = process.env.GEMINI_API_KEY;
        if (!key) {
            console.error("No API Key found");
            return;
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach((m: any) => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.log("No models found or error:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
