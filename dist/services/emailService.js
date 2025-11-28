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
exports.sendPasswordResetEmail = exports.sendSessionReminder = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
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
    }
    else {
        console.log('SMTP Server is ready to take our messages');
    }
});
const sendEmail = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Attempting to send email to: ${to} with subject: ${subject}`);
    try {
        const info = yield transporter.sendMail({
            from: '"SkillBridge" <no-reply@skillbridge.com>',
            to,
            subject,
            html,
        });
        console.log("Message sent: %s", info.messageId);
    }
    catch (error) {
        console.error("Error sending email:", error);
    }
});
exports.sendEmail = sendEmail;
const sendSessionReminder = (session, user) => __awaiter(void 0, void 0, void 0, function* () {
    const subject = `Upcoming Session Reminder: ${session.agenda}`;
    const html = `
        <h1>Session Reminder</h1>
        <p>Hi ${user.name},</p>
        <p>You have a session scheduled for <strong>${new Date(session.startAt).toLocaleString()}</strong>.</p>
        <p>Topic: ${session.agenda}</p>
        <br/>
        <a href="http://localhost:5173/session/${session.webrtcRoomId}">Join Session</a>
    `;
    yield (0, exports.sendEmail)(user.email, subject, html);
});
exports.sendSessionReminder = sendSessionReminder;
const sendPasswordResetEmail = (user, token) => __awaiter(void 0, void 0, void 0, function* () {
    const subject = 'Password Reset Request';
    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
    const html = `
        <h1>Password Reset</h1>
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
    `;
    yield (0, exports.sendEmail)(user.email, subject, html);
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
