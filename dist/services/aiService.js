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
exports.updateLearningPathProgress = exports.generateLearningPath = exports.generateSessionSummary = void 0;
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
const generateLearningPath = (field) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.GEMINI_API_KEY)
            return null;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
        const prompt = `
            Generate a comprehensive 4-week learning path for a student interested in "${field}".
            Return ONLY a valid JSON object with the following structure:
            {
                "weeklyPlan": [
                    { "weekNumber": 1, "topic": "...", "tasks": [{ "id": "w1t1", "title": "...", "description": "...", "isCompleted": false }] }
                ],
                "skillTree": [
                    { "id": "root", "label": "${field} Basics", "children": ["child1", "child2"], "isUnlocked": true, "isCompleted": false },
                    { "id": "child1", "label": "...", "children": [], "isUnlocked": false, "isCompleted": false }
                ],
                "projects": [
                    { "id": "p1", "title": "...", "description": "...", "deadline": "2024-12-31", "isCompleted": false }
                ]
            }
            Ensure the "deadline" for projects is roughly 1 month from now.
        `;
        const result = yield model.generateContent(prompt);
        const response = yield result.response;
        const text = response.text();
        return JSON.parse(text);
    }
    catch (error) {
        console.error('Error generating learning path:', error);
        return null;
    }
});
exports.generateLearningPath = generateLearningPath;
const updateLearningPathProgress = (currentPath, sessionSummary) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.GEMINI_API_KEY)
            return null;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
        const prompt = `
            Analyze the following session summary and update the student's learning path progress.
            
            **Session Summary:** "${sessionSummary}"
            
            **Current Learning Path (JSON):** ${JSON.stringify(currentPath)}
            
            **Instructions:**
            - Mark any tasks in "weeklyPlan" as "isCompleted": true if the session summary indicates they were discussed or mastered.
            - Mark any nodes in "skillTree" as "isCompleted": true if mastered. Unlock children if parent is completed.
            - Return the FULLY UPDATED JSON object with the same structure.
        `;
        const result = yield model.generateContent(prompt);
        const response = yield result.response;
        const text = response.text();
        return JSON.parse(text);
    }
    catch (error) {
        console.error('Error updating learning path progress:', error);
        return null;
    }
});
exports.updateLearningPathProgress = updateLearningPathProgress;
