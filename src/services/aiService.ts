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

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

export const generateLearningPath = async (field: string, months = 3): Promise<any | null> => {
    try {
        if (!process.env.GEMINI_API_KEY) return null;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

        const weeks = Math.max(1, Math.floor(months) * 4);
        const prompt = `
            Generate a comprehensive ${weeks}-week (${months}-month) learning path for a student interested in "${field}".
            Return ONLY a valid JSON object with the following structure. The "weeklyPlan" array MUST contain exactly ${weeks} objects (week 1 through week ${weeks}):
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
            Ensure the "deadline" for projects is roughly 3 months from now.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = cleanJSON(response.text());
        console.log("Generated learning path JSON:", text);
        let parsed: any = JSON.parse(text);

        // Ensure we have exactly `weeks`. If the model returned fewer weeks,
        // programmatically extend the plan by copying the last available week
        // and adjusting week numbers and task IDs. This guarantees 3-month output
        // even if the model under-generates.
        const TARGET_WEEKS = weeks;
        if (!parsed.weeklyPlan || parsed.weeklyPlan.length === 0) {
            parsed.weeklyPlan = [];
        }

        if (parsed.weeklyPlan.length < TARGET_WEEKS) {
            const existing = parsed.weeklyPlan;
            const last = existing[existing.length - 1] || { topic: `${field} - Continued`, tasks: [{ id: `w1t1`, title: 'Continue learning', description: 'Self-study and practice', isCompleted: false }], weekNumber: existing.length || 0 };
            for (let i = existing.length; i < TARGET_WEEKS; i++) {
                const newWeekNumber = i + 1;
                // deep copy last
                const copy = JSON.parse(JSON.stringify(last));
                copy.weekNumber = newWeekNumber;
                // update task ids and reset completion
                if (Array.isArray(copy.tasks)) {
                    copy.tasks = copy.tasks.map((t: any, idx: number) => ({ ...t, id: `w${newWeekNumber}t${idx + 1}`, isCompleted: false }));
                } else {
                    copy.tasks = [{ id: `w${newWeekNumber}t1`, title: copy.topic ? `Continue ${copy.topic}` : 'Practice and review', description: 'Practice exercises and review', isCompleted: false }];
                }
                existing.push(copy);
            }
            parsed.weeklyPlan = existing;
            console.warn(`AI returned ${existing.length} weeks; expanded to ${TARGET_WEEKS} weeks.`);
        }

        // Normalize projects' deadlines to be roughly 3 months from now if missing or obviously far
        if (Array.isArray(parsed.projects)) {
            const threeMonthsFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
            const iso = threeMonthsFromNow.toISOString();
            parsed.projects = parsed.projects.map((p: any) => ({ ...p, deadline: p.deadline ? p.deadline : iso }));
        }

        return parsed;
    } catch (error: any) {
        console.error('Error generating learning path:', error);
        return null;
    }
};

export const updateLearningPathProgress = async (currentPath: any, sessionSummary: string): Promise<any | null> => {
    try {
        if (!process.env.GEMINI_API_KEY) return null;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

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

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

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

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

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

export const generateTopicResources = async (topic: string) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

        const prompt = `
        For the topic "${topic}", provide a brief explanation and 3-5 high-quality learning resources.
        Return ONLY a JSON object with this structure:
        {
            "explanation": "A concise explanation of the concept (2-3 sentences).",
            "resources": [
                { "title": "Resource Title", "url": "URL to the resource", "type": "Video/Article/Course" }
            ]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return JSON.parse(cleanJSON(text));
    } catch (error) {
        console.error('Error generating topic resources:', error);
        return null;
    }
};

export const generateEmbedding = async (text: string): Promise<number[] | null> => {
    try {
        if (!process.env.GEMINI_API_KEY) return null;

        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        const embedding = result.embedding;
        return embedding.values;
    } catch (error) {
        console.error('Error generating embedding:', error);
        return null;
    }
};

export const moderateContent = async (text: string): Promise<{ flagged: boolean; reason?: string } | null> => {
    try {
        if (!process.env.GEMINI_API_KEY) return null;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

        const prompt = `
            Analyze the following text for safety violations, including harassment, hate speech, sexual content, or dangerous activities.
            
            Text: "${text}"
            
            Return ONLY a JSON object:
            {
                "flagged": boolean,
                "reason": "Brief explanation if flagged, otherwise null"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = cleanJSON(response.text());
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error moderating content:', error);
        return null;
    }
};
