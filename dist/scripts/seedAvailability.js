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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const MentorProfile_1 = __importDefault(require("../models/MentorProfile"));
dotenv_1.default.config();
const seedAvailability = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined');
        }
        yield mongoose_1.default.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        const mentors = yield MentorProfile_1.default.find({});
        if (mentors.length === 0) {
            console.log('No mentors found');
            process.exit(1);
        }
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
        for (const mentor of mentors) {
            mentor.availability = days.map(day => ({
                day,
                slots,
                timezone: 'UTC'
            }));
            yield mentor.save();
            console.log(`Updated availability for mentor: ${mentor._id}`);
        }
        console.log('Seeding complete');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding availability:', error);
        process.exit(1);
    }
});
seedAvailability();
