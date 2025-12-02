import mongoose, { Document, Schema } from 'mongoose';

export interface ITask {
    id: string;
    title: string;
    description: string;
    isCompleted: boolean;
}

export interface IWeekPlan {
    weekNumber: number;
    topic: string;
    tasks: ITask[];
}

export interface ISkillNode {
    id: string;
    label: string;
    children: string[]; // IDs of children nodes
    isUnlocked: boolean;
    isCompleted: boolean;
}

export interface IProject {
    id: string;
    title: string;
    description: string;
    deadline: Date;
    isCompleted: boolean;
}

export interface ILearningPath extends Document {
    menteeId: mongoose.Types.ObjectId;
    field: string;
    weeklyPlan: IWeekPlan[];
    skillTree: ISkillNode[];
    projects: IProject[];
    createdAt: Date;
    updatedAt: Date;
}

const learningPathSchema = new Schema<ILearningPath>({
    menteeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    field: { type: String, required: true },
    weeklyPlan: [{
        weekNumber: Number,
        topic: String,
        tasks: [{
            id: String,
            title: String,
            description: String,
            isCompleted: { type: Boolean, default: false }
        }]
    }],
    skillTree: [{
        id: String,
        label: String,
        children: [String],
        isUnlocked: { type: Boolean, default: false },
        isCompleted: { type: Boolean, default: false }
    }],
    projects: [{
        id: String,
        title: String,
        description: String,
        deadline: Date,
        isCompleted: { type: Boolean, default: false }
    }]
}, {
    timestamps: true
});

const LearningPath = mongoose.model<ILearningPath>('LearningPath', learningPathSchema);
export default LearningPath;
