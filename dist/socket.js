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
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const Message_1 = __importDefault(require("./models/Message"));
const Whiteboard_1 = __importDefault(require("./models/Whiteboard"));
const initSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id, '(v2 - Whiteboard Fix)');
        socket.on('join-room', (roomId, userId) => __awaiter(void 0, void 0, void 0, function* () {
            socket.join(roomId);
            socket.join(userId);
            socket.to(roomId).emit('user-connected', userId);
            console.log(`User ${userId} joined room ${roomId}`);
            // Load chat history
            try {
                const messages = yield Message_1.default.find({ roomId }).sort({ timestamp: 1 }).limit(50);
                socket.emit('chat-history', messages);
            }
            catch (error) {
                console.error('Error loading chat history:', error);
            }
            // Load whiteboard state
            try {
                let whiteboard = yield Whiteboard_1.default.findOne({ roomId });
                if (!whiteboard) {
                    whiteboard = yield Whiteboard_1.default.create({ roomId, strokes: [] });
                }
                socket.emit('whiteboard-state', whiteboard.strokes);
            }
            catch (error) {
                console.error('Error loading whiteboard:', error);
            }
        }));
        socket.on('offer', (payload) => {
            io.to(payload.target).emit('offer', payload);
        });
        socket.on('answer', (payload) => {
            io.to(payload.target).emit('answer', payload);
        });
        socket.on('ice-candidate', (incoming) => {
            io.to(incoming.target).emit('ice-candidate', incoming.candidate);
        });
        socket.on('send-message', (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, message, senderId, senderName }) {
            const msgData = { message, senderId, senderName, timestamp: new Date() };
            // Save to DB
            try {
                yield Message_1.default.create({ roomId, senderId, senderName, message });
            }
            catch (error) {
                console.error('Error saving message:', error);
            }
            io.to(roomId).emit('receive-message', msgData);
        }));
        // Whiteboard Events
        socket.on('get-whiteboard', (roomId) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let whiteboard = yield Whiteboard_1.default.findOne({ roomId });
                if (!whiteboard) {
                    whiteboard = yield Whiteboard_1.default.create({ roomId, strokes: [] });
                }
                socket.emit('whiteboard-state', whiteboard.strokes);
            }
            catch (error) {
                console.error('Error loading whiteboard:', error);
            }
        }));
        socket.on('draw-stroke', (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, stroke }) {
            socket.to(roomId).emit('draw-stroke', stroke);
            try {
                yield Whiteboard_1.default.findOneAndUpdate({ roomId }, { $push: { strokes: stroke } }, { upsert: true });
            }
            catch (error) {
                console.error('Error saving stroke:', error);
            }
        }));
        socket.on('clear-board', (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId }) {
            io.to(roomId).emit('clear-board');
            try {
                yield Whiteboard_1.default.findOneAndUpdate({ roomId }, { $set: { strokes: [] } });
            }
            catch (error) {
                console.error('Error clearing whiteboard:', error);
            }
        }));
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
    return io;
};
exports.initSocket = initSocket;
