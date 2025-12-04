import mongoose, { Document, Schema } from 'mongoose';

export interface IMenteeProfile extends Document {
    userId: mongoose.Types.ObjectId;
    interests: string[];
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    learningGoals: string[];
    preferredTimes: string[];
    embedding?: number[];
}

const menteeProfileSchema = new Schema<IMenteeProfile>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    interests: [{ type: String }],
    skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    learningGoals: [{ type: String }],
    preferredTimes: [{ type: String }],
    embedding: { type: [Number], index: true }
}, {
    timestamps: true
});

const MenteeProfile = mongoose.model<IMenteeProfile>('MenteeProfile', menteeProfileSchema);
export default MenteeProfile;
