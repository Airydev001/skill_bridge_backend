import { GoogleGenerativeAI } from '@google/generative-ai';
import { ISession } from '../models/Session';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateSessionSummary = async (session: ISession): Promise<string | null> => {
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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error('Error generating AI session summary:', error);
        return null;
    }
};
