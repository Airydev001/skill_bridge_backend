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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSessionSummary = void 0;
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const generateSessionSummary = (session) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY is not set. Skipping AI summary generation.');
            return null;
        }
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            Please generate a concise and professional summary for the following mentorship session.
            
            **Session Details:**
            - **Agenda:** ${session.agenda}
            - **Notes:** ${session.notes || 'No notes provided.'}
            - **Duration:** ${session.endAt.getTime() - session.startAt.getTime()} ms
            
            **Instructions:**
            - Summarize the key topics discussed based on the agenda and notes.
            - Highlight any action items or key takeaways if implied.
            - Keep it under 150 words.
            - Use a professional tone.
        `;
        const result = yield model.generateContent(prompt);
        const response = yield result.response;
        const text = response.text();
        return text;
    }
    catch (error) {
        console.error('Error generating AI session summary:', error);
        return null;
    }
});
exports.generateSessionSummary = generateSessionSummary;
