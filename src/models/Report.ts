import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
    reporterId: mongoose.Types.ObjectId;
    reportedId: mongoose.Types.ObjectId;
    reason: string;
    description: string;
    status: 'pending' | 'resolved' | 'dismissed';
    createdAt: Date;
}

const reportSchema = new Schema<IReport>({
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportedId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' }
}, {
    timestamps: true
});

const Report = mongoose.model<IReport>('Report', reportSchema);
export default Report;
