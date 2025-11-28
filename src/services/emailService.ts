import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('SMTP Connection Error:', error);
    } else {
        console.log('SMTP Server is ready to take our messages');
    }
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    console.log(`Attempting to send email to: ${to} with subject: ${subject}`);
    try {
        const info = await transporter.sendMail({
            from: '"SkillBridge" <no-reply@skillbridge.com>',
            to,
            subject,
            html,
        });
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export const sendSessionReminder = async (session: any, user: any) => {
    const subject = `Upcoming Session Reminder: ${session.agenda}`;
    const html = `
        <h1>Session Reminder</h1>
        <p>Hi ${user.name},</p>
        <p>You have a session scheduled for <strong>${new Date(session.startAt).toLocaleString()}</strong>.</p>
        <p>Topic: ${session.agenda}</p>
        <br/>
        <a href="${process.env.APP_URL || 'https://skill-bridge-backend-current.onrender.com'}/session/${session.webrtcRoomId}">Join Session</a>
    `;
    await sendEmail(user.email, subject, html);
};

export const sendPasswordResetEmail = async (user: any, token: string) => {
    const subject = 'Password Reset Request';
    const appUrl = process.env.APP_URL || 'https://skill-bridge-backend-current.onrender.com';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    const html = `
        <h1>Password Reset</h1>
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
    `;
    await sendEmail(user.email, subject, html);
};
