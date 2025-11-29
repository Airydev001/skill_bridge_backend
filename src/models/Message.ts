import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    roomId: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: Date;
}

const messageSchema = new Schema<IMessage>({
    roomId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model<IMessage>('Message', messageSchema);
export default Message;
