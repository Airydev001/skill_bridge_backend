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
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const MenteeProfile_1 = __importDefault(require("../models/MenteeProfile"));
const db_1 = __importDefault(require("../config/db"));
dotenv_1.default.config();
const reproduceIssue = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1.default)();
        console.log('Connected to DB');
        // 1. Create a test user
        const email = `test_mentee_${Date.now()}@example.com`;
        const user = yield User_1.default.create({
            name: 'Test Mentee',
            email,
            passwordHash: 'password',
            role: 'mentee'
        });
        console.log(`Created user: ${user._id}`);
        // 2. Create a profile (simulating the controller logic)
        let profile = yield MenteeProfile_1.default.create({
            userId: user._id,
            interests: ['coding'],
            skillLevel: 'beginner',
            learningGoals: ['learn react'],
            preferredTimes: ['morning'],
            embedding: []
        });
        console.log(`Created profile with interests: ${profile.interests}`);
        // 3. Update interests (simulating the controller logic)
        const newInterests = ['coding', 'ai', 'web'];
        // Fetch again to be sure
        profile = (yield MenteeProfile_1.default.findOne({ userId: user._id }));
        if (profile) {
            console.log('Updating interests...');
            // Mimic controller logic
            if (newInterests)
                profile.interests = newInterests;
            yield profile.save();
            console.log('Saved profile.');
        }
        // 4. Verify
        const updatedProfile = yield MenteeProfile_1.default.findOne({ userId: user._id });
        console.log(`Updated profile interests: ${updatedProfile === null || updatedProfile === void 0 ? void 0 : updatedProfile.interests}`);
        if ((updatedProfile === null || updatedProfile === void 0 ? void 0 : updatedProfile.interests.length) === 3 && updatedProfile.interests.includes('ai')) {
            console.log('SUCCESS: Interests updated correctly.');
        }
        else {
            console.error('FAILURE: Interests did not update correctly.');
        }
        // Cleanup
        yield MenteeProfile_1.default.deleteOne({ _id: profile === null || profile === void 0 ? void 0 : profile._id });
        yield User_1.default.deleteOne({ _id: user._id });
        console.log('Cleanup done.');
        process.exit(0);
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
});
reproduceIssue();
