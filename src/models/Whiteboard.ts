import mongoose, { Document, Schema } from 'mongoose';

export interface IWhiteboard extends Document {
    roomId: string;
    strokes: {
        points: { x: number; y: number }[];
        color: string;
        size: number;
    }[];
}

const whiteboardSchema = new Schema<IWhiteboard>({
    roomId: { type: String, required: true, unique: true },
    strokes: [{
        points: [{
            x: { type: Number, required: true },
            y: { type: Number, required: true }
        }],
        color: { type: String, default: '#000000' },
        size: { type: Number, default: 5 }
    }]
}, {
    timestamps: true
});

const Whiteboard = mongoose.model<IWhiteboard>('Whiteboard', whiteboardSchema);
export default Whiteboard;
