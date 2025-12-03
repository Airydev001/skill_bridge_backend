import { Request, Response } from 'express';
import LearningPath from '../models/LearningPath';
import { generateLearningPath, generateTopicResources } from '../services/aiService';

export const createPath = async (req: Request, res: Response) => {
    try {
        const { field } = req.body;
        const userId = (req as any).user._id;

        // Check if path already exists for this field
        const existingPath = await LearningPath.findOne({ menteeId: userId, field });
        if (existingPath) {
            return res.status(200).json(existingPath);
        }

        // Generate new path via AI
        const generatedPathData = await generateLearningPath(field);
        if (!generatedPathData) {
            return res.status(500).json({ message: 'Failed to generate learning path' });
        }

        const newPath = new LearningPath({
            menteeId: userId,
            field,
            ...generatedPathData
        });

        await newPath.save();
        res.status(201).json(newPath);
    } catch (error) {
        console.error('Error creating learning path:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPath = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const path = await LearningPath.findOne({ menteeId: userId }).sort({ createdAt: -1 }); // Get latest
        if (!path) {
            return res.status(404).json({ message: 'No learning path found' });
        }
        res.json(path);
    } catch (error) {
        console.error('Error fetching learning path:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deletePath = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        await LearningPath.deleteMany({ menteeId: userId });
        res.json({ message: 'Learning path deleted' });
    } catch (error) {
        console.error('Error deleting learning path:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const generateResources = async (req: Request, res: Response) => {
    try {
        const { topic } = req.body;
        if (!topic) {
            return res.status(400).json({ message: 'Topic is required' });
        }

        const resources = await generateTopicResources(topic);
        if (!resources) {
            return res.status(500).json({ message: 'Failed to generate resources' });
        }

        res.json(resources);
    } catch (error) {
        console.error('Error generating resources:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
