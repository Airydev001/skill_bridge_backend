import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
    mentorId: mongoose.Types.ObjectId;
    menteeId: mongoose.Types.ObjectId;
    startAt: Date;
    endAt: Date;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
    agenda: string;
    rating?: number;
    notes?: string;
    webrtcRoomId: string;
    recordingUrl?: string;
    aiSummary?: string;
    createdAt: Date;
    activeStartedAt?: Date;
}

const sessionSchema = new Schema<ISession>({
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    menteeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    activeStartedAt: { type: Date },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'no_show'], default: 'scheduled' },
    agenda: { type: String, required: true },
    rating: { type: Number },
    notes: { type: String },
    webrtcRoomId: { type: String, required: true },
    recordingUrl: { type: String },
    aiSummary: { type: String }
}, {
    timestamps: true
});

const Session = mongoose.model<ISession>('Session', sessionSchema);
export default Session;
