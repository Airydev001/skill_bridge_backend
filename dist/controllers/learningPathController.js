"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResources = exports.deletePath = exports.getPath = exports.createPath = void 0;
const LearningPath_1 = __importDefault(require("../models/LearningPath"));
const aiService_1 = require("../services/aiService");
const createPath = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { field } = req.body;
        const userId = req.user._id;
        // Check if path already exists for this field
        const existingPath = yield LearningPath_1.default.findOne({ menteeId: userId, field });
        if (existingPath) {
            return res.status(200).json(existingPath);
        }
        // Generate new path via AI
        const generatedPathData = yield (0, aiService_1.generateLearningPath)(field);
        if (!generatedPathData) {
            return res.status(500).json({ message: 'Failed to generate learning path' });
        }
        const newPath = new LearningPath_1.default(Object.assign({ menteeId: userId, field }, generatedPathData));
        yield newPath.save();
        res.status(201).json(newPath);
    }
    catch (error) {
        console.error('Error creating learning path:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createPath = createPath;
const getPath = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const path = yield LearningPath_1.default.findOne({ menteeId: userId }).sort({ createdAt: -1 }); // Get latest
        if (!path) {
            return res.status(404).json({ message: 'No learning path found' });
        }
        res.json(path);
    }
    catch (error) {
        console.error('Error fetching learning path:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getPath = getPath;
const deletePath = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        yield LearningPath_1.default.deleteMany({ menteeId: userId });
        res.json({ message: 'Learning path deleted' });
    }
    catch (error) {
        console.error('Error deleting learning path:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deletePath = deletePath;
const generateResources = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { topic } = req.body;
        if (!topic) {
            return res.status(400).json({ message: 'Topic is required' });
        }
        const resources = yield (0, aiService_1.generateTopicResources)(topic);
        if (!resources) {
            return res.status(500).json({ message: 'Failed to generate resources' });
        }
        res.json(resources);
    }
    catch (error) {
        console.error('Error generating resources:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.generateResources = generateResources;
