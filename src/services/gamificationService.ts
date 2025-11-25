import User from '../models/User';
import Session from '../models/Session';

export const checkAndAwardBadges = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) return;

    const completedSessions = await Session.countDocuments({
        $or: [{ mentorId: userId }, { menteeId: userId }],
        status: 'completed'
    });

    const newBadges: string[] = [];

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
    const lastSession = user.streak?.lastSessionDate ? new Date(user.streak.lastSessionDate) : null;

    let newStreakCount = user.streak?.count || 0;

    if (lastSession) {
        const diffTime = Math.abs(today.getTime() - lastSession.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
            // Continued streak (same day or next day)
            if (today.getDate() !== lastSession.getDate()) {
                newStreakCount++;
            }
        } else {
            // Broken streak
            newStreakCount = 1;
        }
    } else {
        newStreakCount = 1;
    }

    // Badge: Streak Master
    if (newStreakCount >= 3 && !user.badges.includes('Streak Master')) {
        newBadges.push('Streak Master');
    }

    // Update User
    if (newBadges.length > 0 || newStreakCount !== user.streak?.count) {
        user.badges = [...user.badges, ...newBadges];
        user.streak = {
            count: newStreakCount,
            lastSessionDate: today
        };
        await user.save();
        console.log(`User ${user.name} updated: Badges=[${newBadges}], Streak=${newStreakCount}`);
    }
};
