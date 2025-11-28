"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const initSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        socket.on('join-room', (roomId, userId) => {
            socket.join(roomId);
            socket.join(userId);
            socket.to(roomId).emit('user-connected', userId);
            console.log(`User ${userId} joined room ${roomId}`);
        });
        socket.on('offer', (payload) => {
            io.to(payload.target).emit('offer', payload);
        });
        socket.on('answer', (payload) => {
            io.to(payload.target).emit('answer', payload);
        });
        socket.on('ice-candidate', (incoming) => {
            io.to(incoming.target).emit('ice-candidate', incoming.candidate);
        });
        socket.on('send-message', ({ roomId, message, senderId, senderName }) => {
            io.to(roomId).emit('receive-message', { message, senderId, senderName, timestamp: new Date() });
        });
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
    return io;
};
exports.initSocket = initSocket;
