// lib/socket.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from './jwt';
import Message from '../models/message';
import Conversation from '../models/conversation';
import User from '../models/User';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const initializeSocket = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:8081',
      credentials: true,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization'],
      exposedHeaders: ['Authorization']
    }
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyAccessToken(token) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    if (!userId) return;

    console.log(`User ${userId} connected to socket`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle sending messages
    socket.on('send_message', async (data: { conversationId: string; content: string; recipientId: string }) => {
      try {
        // Verify user is part of conversation
        const conversation = await Conversation.findOne({
          _id: data.conversationId,
          participants: userId
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Create message
        const message = await Message.create({
          conversation: data.conversationId,
          sender: userId,
          content: data.content,
          readBy: [userId] // Sender has read their own message
        });

        // Populate sender info
        await message.populate('sender', 'fullName username avatar');

        // Update conversation's last message
        await Conversation.findByIdAndUpdate(data.conversationId, {
          lastMessage: message._id,
          lastMessageAt: new Date()
        });

        // Emit to recipient
        io.to(`user:${data.recipientId}`).emit('new_message', {
          id: message._id,
          conversationId: data.conversationId,
          content: message.content,
          sender: {
            id: (message.sender as any)._id,
            name: (message.sender as any).fullName,
            username: (message.sender as any).username,
            avatar: (message.sender as any).avatar
          },
          isSent: false,
          isRead: false,
          timestamp: message.createdAt
        });

        // Emit confirmation to sender
        socket.emit('message_sent', {
          id: message._id,
          conversationId: data.conversationId,
          content: message.content,
          sender: {
            id: (message.sender as any)._id,
            name: (message.sender as any).fullName,
            username: (message.sender as any).username,
            avatar: (message.sender as any).avatar
          },
          isSent: true,
          isRead: true,
          timestamp: message.createdAt
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data: { conversationId: string; recipientId: string }) => {
      socket.to(`user:${data.recipientId}`).emit('user_typing', {
        conversationId: data.conversationId,
        userId
      });
    });

    socket.on('stop_typing', (data: { conversationId: string; recipientId: string }) => {
      socket.to(`user:${data.recipientId}`).emit('user_stop_typing', {
        conversationId: data.conversationId,
        userId
      });
    });

    // Handle message read
    socket.on('mark_read', async (data: { conversationId: string }) => {
      try {
        await Message.updateMany(
          {
            conversation: data.conversationId,
            sender: { $ne: userId },
            readBy: { $ne: userId }
          },
          {
            $addToSet: { readBy: userId }
          }
        );

        // Notify sender that messages were read
        const conversation = await Conversation.findById(data.conversationId);
        if (conversation) {
          const otherParticipant = conversation.participants.find(
            (p: any) => p.toString() !== userId
          );
          if (otherParticipant) {
            io.to(`user:${otherParticipant}`).emit('messages_read', {
              conversationId: data.conversationId,
              userId
            });
          }
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected from socket`);
    });
  });

  return io;
};

