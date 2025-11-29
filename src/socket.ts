import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import Message from './models/Message';
import Whiteboard from './models/Whiteboard';

export const initSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id, '(v2 - Whiteboard Fix)');

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

            // Load whiteboard state
            try {
                let whiteboard = await Whiteboard.findOne({ roomId });
                if (!whiteboard) {
                    whiteboard = await Whiteboard.create({ roomId, strokes: [] });
                }
                socket.emit('whiteboard-state', whiteboard.strokes);
            } catch (error) {
                console.error('Error loading whiteboard:', error);
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

        // Whiteboard Events
        socket.on('get-whiteboard', async (roomId) => {
            try {
                let whiteboard = await Whiteboard.findOne({ roomId });
                if (!whiteboard) {
                    whiteboard = await Whiteboard.create({ roomId, strokes: [] });
                }
                socket.emit('whiteboard-state', whiteboard.strokes);
            } catch (error) {
                console.error('Error loading whiteboard:', error);
            }
        });

        socket.on('draw-stroke', async ({ roomId, stroke }) => {
            socket.to(roomId).emit('draw-stroke', stroke);

            try {
                await Whiteboard.findOneAndUpdate(
                    { roomId },
                    { $push: { strokes: stroke } },
                    { upsert: true }
                );
            } catch (error) {
                console.error('Error saving stroke:', error);
            }
        });

        socket.on('clear-board', async ({ roomId }) => {
            io.to(roomId).emit('clear-board');

            try {
                await Whiteboard.findOneAndUpdate(
                    { roomId },
                    { $set: { strokes: [] } }
                );
            } catch (error) {
                console.error('Error clearing whiteboard:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};
