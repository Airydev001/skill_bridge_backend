import mongoose, { Document, Schema } from 'mongoose';

export interface IMentorProfile extends Document {
    userId: mongoose.Types.ObjectId;
    bio: string;
    skills: string[];
    yearsExperience: number;
    introVideoUrl?: string;
    languages: string[];
    availability: {
        day: string;
        slots: string[];
        timezone: string;
    }[];
    status: 'pending' | 'approved' | 'rejected';
    metrics: {
        menteesHelped: number;
        hoursDonated: number;
    };
}

const mentorProfileSchema = new Schema<IMentorProfile>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bio: { type: String, required: true },
    skills: [{ type: String }],
    yearsExperience: { type: Number, required: true },
    introVideoUrl: { type: String },
    languages: [{ type: String }],
    availability: [{
        day: { type: String },
        slots: [{ type: String }],
        timezone: { type: String }
    }],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    metrics: {
        menteesHelped: { type: Number, default: 0 },
        hoursDonated: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

const MentorProfile = mongoose.model<IMentorProfile>('MentorProfile', mentorProfileSchema);
export default MentorProfile;
