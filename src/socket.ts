import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

import Message from './models/Message';

export const initSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join-room', async (roomId, userId) => {
            socket.join(roomId);
            socket.join(userId);
            socket.to(roomId).emit('user-connected', userId);
            console.log(`User ${userId} joined room ${roomId}`);

            // Load chat history
            try {
                const messages = await Message.find({ roomId }).sort({ timestamp: 1 }).limit(50);
                socket.emit('chat-history', messages);
            } catch (error) {
                console.error('Error loading chat history:', error);
            }
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

        socket.on('send-message', async ({ roomId, message, senderId, senderName }) => {
            const msgData = { message, senderId, senderName, timestamp: new Date() };

            // Save to DB
            try {
                await Message.create({ roomId, senderId, senderName, message });
            } catch (error) {
                console.error('Error saving message:', error);
            }

            io.to(roomId).emit('receive-message', msgData);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};
