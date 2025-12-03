import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load env from backend root
const envPath = path.resolve(__dirname, '../../.env');
console.log("Loading .env from:", envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env:", result.error);
}

console.log("API Key present:", !!process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function testModel(modelName: string) {
    console.log(`\nTesting model: ${modelName}`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { responseMimeType: "application/json" } });
        const prompt = `Generate a simple JSON object: { "hello": "world" }`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log(`Success with ${modelName}! Response:`, response.text());
        return true;
    } catch (error: any) {
        console.log(`Failed with ${modelName}:`, error.message);
        return false;
    }
}

async function test() {
    console.log("Starting model connectivity test...");

    // Try 1.5 Flash (Most reliable)
    await testModel("gemini-1.5-flash");

    // Try 1.5 Pro
    await testModel("gemini-1.5-pro");

    // Try 2.5 Pro
    await testModel("gemini-2.5-pro");
}

test();
