// routes/messages.ts
import { Router } from 'express';
import { z } from 'zod';
import Conversation from '../models/conversation';
import Message from '../models/message';
import Friendship from '../models/Friendship';

type FriendListItem = {
  id: string;
  name: string;
  username: string;
  avatar?: string;
};
import { requireAuth } from '../middlewares/auth';

const router = Router();

// Validation schemas
const sendMessageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
  content: z.string().min(1, 'Message content is required').max(5000, 'Message too long'),
});

// Get all conversations for the current user
router.get('/conversations', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'fullName username avatar')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1, updatedAt: -1 });

    const conversationsList = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipant = conv.participants.find(
          (p: any) => p._id.toString() !== userId
        ) as any;

        if (!otherParticipant) return null;

        // Get unread count
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: userId },
          readBy: { $ne: userId }
        });

        return {
          id: conv._id,
          user: {
            id: otherParticipant._id,
            name: otherParticipant.fullName,
            username: otherParticipant.username,
            avatar: otherParticipant.avatar
          },
          lastMessage: conv.lastMessage ? {
            content: (conv.lastMessage as any).content,
            timestamp: (conv.lastMessage as any).createdAt
          } : null,
          lastMessageAt: conv.lastMessageAt || conv.updatedAt,
          unreadCount
        };
      })
    );


    // Filter out null values
    const filtered = conversationsList.filter(c => c !== null);

    return res.json({ conversations: filtered });
  } catch (error) {
    console.error('Get conversations error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', requireAuth, async (req: any, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await Message.find({
      conversation: conversationId
    })
    .populate('sender', 'fullName username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      {
        $addToSet: { readBy: userId }
      }
    );

    const messagesList = messages.reverse().map((msg: any) => ({
      id: msg._id,
      content: msg.content,
      sender: {
        id: msg.sender._id,
        name: msg.sender.fullName,
        username: msg.sender.username,
        avatar: msg.sender.avatar
      },
      isSent: msg.sender._id.toString() === userId,
      isRead: msg.readBy.some((id: any) => id.toString() === userId),
      timestamp: msg.createdAt
    }));

    return res.json({ messages: messagesList });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get or create conversation with a friend
router.get('/conversations/with/:friendId', requireAuth, async (req: any, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    // Check if they are friends
    const friendship = await Friendship.findOne({
      status: 'accepted',
      $or: [
        { requester: userId, recipient: friendId },
        { requester: friendId, recipient: userId }
      ]
    });

    if (!friendship) {
      return res.status(403).json({ error: 'You can only message friends' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, friendId], $size: 2 }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, friendId]
      });
    }

    return res.json({ conversationId: conversation._id });
  } catch (error) {
    console.error('Get conversation error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get friends list for messaging (only accepted friends)
router.get('/messages/friends', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const searchQuery = (req.query.search as string || '').trim();

    const friendships = await Friendship.find({
      status: 'accepted',
      $or: [
        { requester: userId },
        { recipient: userId }
      ]
    })
    .populate('requester', 'fullName username avatar')
    .populate('recipient', 'fullName username avatar');

    const friends = friendships
      .map<FriendListItem | null>(friendship => {
        try {
          const requester = friendship.requester as any;
          const recipient = friendship.recipient as any;
          
          // Skip if populate failed
          if (!requester || !recipient) {
            return null;
          }

          const friend = (requester._id?.toString() || requester.toString()) === userId 
            ? recipient 
            : requester;
          
          // Ensure we have valid data
          if (!friend || !friend.fullName || !friend.username) {
            return null;
          }
          const friendData: FriendListItem = {
            id: (friend._id?.toString() || friend.toString()),
            name: friend.fullName,
            username: friend.username,
          };
          
          if (friend.avatar) {
            friendData.avatar = friend.avatar;
          }

          return friendData;
        } catch (mapError) {
          console.error('Error mapping friendship:', mapError);
          return null;
        }
      })
      .filter((friend): friend is FriendListItem => {
        if (!friend) return false;
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return friend.name?.toLowerCase().includes(query) || 
               friend.username?.toLowerCase().includes(query);
      });

    return res.json({ friends });
  } catch (error: any) {
    console.error('Get friends for messaging error:', error);
    return res.status(500).json({ 
      error: error.message || 'Server error'
    });
  }
});

export default router;

