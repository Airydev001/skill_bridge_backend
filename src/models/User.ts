import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: 'mentee' | 'mentor' | 'admin';
    avatarUrl?: string;
    createdAt: Date;
    lastLogin?: Date;
    isVerified: boolean;
    profile?: mongoose.Types.ObjectId;
    badges: string[];
    points: number;
    streak: {
        count: number;
        lastSessionDate?: Date;
    };
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['mentee', 'mentor', 'admin'], default: 'mentee' },
    avatarUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    profile: { type: Schema.Types.ObjectId, refPath: 'role' },
    badges: [{ type: String }],
    points: { type: Number, default: 0 },
    streak: {
        count: { type: Number, default: 0 },
        lastSessionDate: { type: Date }
    }
}, {
    timestamps: true
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
};

userSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
