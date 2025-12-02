import mongoose, { Document, Schema } from 'mongoose';

export interface IChallenge extends Document {
    menteeId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    status: 'pending' | 'submitted' | 'graded' | 'reviewed';
    submission?: {
        code: string;
        submittedAt: Date;
    };
    aiEvaluation?: {
        score: number;
        feedback: string;
        passed: boolean;
    };
    mentorFeedback?: string;
    points: number;
    createdAt: Date;
    updatedAt: Date;
}

const challengeSchema = new Schema<IChallenge>({
    menteeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    category: { type: String, required: true },
    status: { type: String, enum: ['pending', 'submitted', 'graded', 'reviewed'], default: 'pending' },
    submission: {
        code: String,
        submittedAt: Date
    },
    aiEvaluation: {
        score: Number,
        feedback: String,
        passed: Boolean
    },
    mentorFeedback: String,
    points: { type: Number, default: 0 }
}, {
    timestamps: true
});

const Challenge = mongoose.model<IChallenge>('Challenge', challengeSchema);
export default Challenge;
