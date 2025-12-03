import { GoogleGenerativeAI } from '@google/generative-ai';
import { ISession } from '../models/Session';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper to clean JSON string
const cleanJSON = (text: string) => {
    return text.replace(/```json\n?|\n?```/g, '').trim();
};

export const generateSessionSummary = async (session: ISession): Promise<string | null> => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY is not set. Skipping AI summary generation.');
            return null;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error('Error generating AI session summary:', error);
        return null;
    }
};

export const generateLearningPath = async (field: string): Promise<any | null> => {
    try {
        if (!process.env.GEMINI_API_KEY) return null;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro", generationConfig: { responseMimeType: "application/json" } });

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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = cleanJSON(response.text());
        return JSON.parse(text);
    } catch (error: any) {
        console.error('Error generating learning path:', error);
        if (error.response) {
            console.error('Gemini API Error Response:', JSON.stringify(error.response, null, 2));
        }
        if (error.message) {
            console.error('Error Message:', error.message);
        }
        return null;
    }
};

export const updateLearningPathProgress = async (currentPath: any, sessionSummary: string): Promise<any | null> => {
    try {
        if (!process.env.GEMINI_API_KEY) return null;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro", generationConfig: { responseMimeType: "application/json" } });

        const prompt = `
            Analyze the following session summary and update the student's learning path progress.
            
            **Session Summary:** "${sessionSummary}"
            
            **Current Learning Path (JSON):** ${JSON.stringify(currentPath)}
            
            **Instructions:**
            - Mark any tasks in "weeklyPlan" as "isCompleted": true if the session summary indicates they were discussed or mastered.
            - Mark any nodes in "skillTree" as "isCompleted": true if mastered. Unlock children if parent is completed.
            - Return the FULLY UPDATED JSON object with the same structure.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = cleanJSON(response.text());
        return JSON.parse(text);
    } catch (error) {
        console.error('Error updating learning path progress:', error);
        return null;
    }
};

export const generateChallenge = async (topic: string, difficulty: string): Promise<any | null> => {
    try {
        if (!process.env.GEMINI_API_KEY) return null;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro", generationConfig: { responseMimeType: "application/json" } });

        const prompt = `
            Generate a coding challenge for a student learning "${topic}" at "${difficulty}" level.
            Return ONLY a valid JSON object with the following structure:
            {
                "title": "Challenge Title",
                "description": "Detailed problem description...",
                "category": "${topic}",
                "difficulty": "${difficulty}",
                "starterCode": "// Write your code here..."
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = cleanJSON(response.text());
        return JSON.parse(text);
    } catch (error) {
        console.error('Error generating challenge:', error);
        return null;
    }
};

export const evaluateSubmission = async (challenge: any, code: string): Promise<any | null> => {
    try {
        if (!process.env.GEMINI_API_KEY) return null;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro", generationConfig: { responseMimeType: "application/json" } });

        const prompt = `
            Evaluate the following code submission for a coding challenge.
            
            **Challenge:**
            Title: ${challenge.title}
            Description: ${challenge.description}
            
            **Student Code:**
            ${code}
            
            **Instructions:**
            - Check for correctness, efficiency, and code quality.
            - Return ONLY a valid JSON object with the following structure:
            {
                "score": 85, // 0-100
                "passed": true, // true if score >= 70
                "feedback": "Constructive feedback..."
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = cleanJSON(response.text());
        return JSON.parse(text);
    } catch (error) {
        console.error('Error evaluating submission:', error);
        return null;
    }
};
