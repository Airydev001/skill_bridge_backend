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
exports.checkAndAwardBadges = void 0;
const User_1 = __importDefault(require("../models/User"));
const Session_1 = __importDefault(require("../models/Session"));
const checkAndAwardBadges = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const user = yield User_1.default.findById(userId);
    if (!user)
        return;
    const completedSessions = yield Session_1.default.countDocuments({
        $or: [{ mentorId: userId }, { menteeId: userId }],
        status: 'completed'
    });
    const newBadges = [];
    // Badge: First Session
    if (completedSessions >= 1 && !user.badges.includes('First Session')) {
        newBadges.push('First Session');
    }
    // Badge: Super Mentor (Mentors only)
    if (user.role === 'mentor' && completedSessions >= 10 && !user.badges.includes('Super Mentor')) {
        newBadges.push('Super Mentor');
    }
    // Streak Logic
    // This is a simplified streak check. In a real app, we'd check consecutive days.
    // Here we just increment if the last session was yesterday or today.
    const today = new Date();
    const lastSession = ((_a = user.streak) === null || _a === void 0 ? void 0 : _a.lastSessionDate) ? new Date(user.streak.lastSessionDate) : null;
    let newStreakCount = ((_b = user.streak) === null || _b === void 0 ? void 0 : _b.count) || 0;
    if (lastSession) {
        const diffTime = Math.abs(today.getTime() - lastSession.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
            // Continued streak (same day or next day)
            if (today.getDate() !== lastSession.getDate()) {
                newStreakCount++;
            }
        }
        else {
            // Broken streak
            newStreakCount = 1;
        }
    }
    else {
        newStreakCount = 1;
    }
    // Badge: Streak Master
    if (newStreakCount >= 3 && !user.badges.includes('Streak Master')) {
        newBadges.push('Streak Master');
    }
    // Update User
    if (newBadges.length > 0 || newStreakCount !== ((_c = user.streak) === null || _c === void 0 ? void 0 : _c.count)) {
        user.badges = [...user.badges, ...newBadges];
        user.streak = {
            count: newStreakCount,
            lastSessionDate: today
        };
        yield user.save();
        console.log(`User ${user.name} updated: Badges=[${newBadges}], Streak=${newStreakCount}`);
    }
});
exports.checkAndAwardBadges = checkAndAwardBadges;
