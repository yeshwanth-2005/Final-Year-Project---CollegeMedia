// routes/friends.ts
import { Router } from 'express';
import { z } from 'zod';
import User, { IUser } from '../models/User';
import Friendship from '../models/Friendship';
import Conversation from '../models/conversation';
import Message from '../models/message';
import Notification from '../models/notification';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// Store Socket.IO instance (will be set from index.ts)
let ioInstance: any = null;
export const setSocketIOInstance = (io: any) => {
  ioInstance = io;
};

// Validation schemas
const sendRequestSchema = z.object({
  recipientUsername: z.string().min(1, 'Username is required'),
});

const respondRequestSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  action: z.enum(['accept', 'reject']),
});

// Get user's friends
router.get('/friends', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const friendships = await Friendship.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    })
    .populate('requester', 'fullName username avatar')
    .populate('recipient', 'fullName username avatar')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

    const friends = friendships.map(friendship => {
      const requester = friendship.requester as unknown as IUser;
      const recipient = friendship.recipient as unknown as IUser;
      const friend = (requester._id as any).toString() === userId 
        ? recipient 
        : requester;
      
      return {
        id: friend._id,
        name: friend.fullName,
        username: friend.username,
        avatar: friend.avatar,
        friendshipId: friendship._id,
        friendsSince: friendship.updatedAt
      };
    });

    const total = await Friendship.countDocuments({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    });

    return res.json({
      friends,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get friends error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get pending friend requests
router.get('/friends/requests', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    
    const pendingRequests = await Friendship.find({
      recipient: userId,
      status: 'pending'
    })
    .populate('requester', 'fullName username avatar')
    .sort({ createdAt: -1 });

    const requests = pendingRequests.map(request => {
      const requester = request.requester as unknown as IUser;
      return {
        id: request._id,
        user: {
          id: requester._id,
          name: requester.fullName,
          username: requester.username,
          avatar: requester.avatar
        },
        sentAt: request.createdAt
      };
    });

    return res.json({ requests });
  } catch (error) {
    console.error('Get pending requests error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Send friend request
router.post('/friends/request', requireAuth, async (req: any, res) => {
  try {
    const { recipientUsername } = sendRequestSchema.parse(req.body);
    const requesterId = req.user.userId;

    // Can't send request to yourself
    const currentUser = await User.findById(requesterId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (currentUser.username === recipientUsername) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    const recipient = await User.findOne({ username: recipientUsername });
    if (!recipient) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if friendship already exists
    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipient._id },
        { requester: recipient._id, recipient: requesterId }
      ]
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'pending') {
        return res.status(409).json({ error: 'Friend request already sent' });
      }
      if (existingFriendship.status === 'accepted') {
        return res.status(409).json({ error: 'Already friends' });
      }
      if (existingFriendship.status === 'blocked') {
        return res.status(403).json({ error: 'Cannot send friend request' });
      }
    }

    // Create new friend request
    const friendship = await Friendship.create({
      requester: requesterId,
      recipient: recipient._id,
      status: 'pending'
    });

    await friendship.populate('requester', 'fullName username avatar');
    await friendship.populate('recipient', 'fullName username avatar');

    // Create notification for recipient
    await Notification.create({
      recipient: recipient._id,
      sender: requesterId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${currentUser.fullName} sent you a friend request`,
      link: '/network',
      relatedId: (friendship._id as any).toString()
    });

    return res.status(201).json({
      message: 'Friend request sent',
      request: {
        id: friendship._id,
        user: {
          id: recipient._id,
          name: recipient.fullName,
          username: recipient.username,
          avatar: recipient.avatar
        },
        sentAt: friendship.createdAt
      }
    });
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ error: 'Invalid input', details: error.issues });
    }
    console.error('Send friend request error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Respond to friend request
router.post('/friends/respond', requireAuth, async (req: any, res) => {
  try {
    const { requestId, action } = respondRequestSchema.parse(req.body);
    const userId = req.user.userId;

    const friendship = await Friendship.findOne({
      _id: requestId,
      recipient: userId,
      status: 'pending'
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (action === 'accept') {
      friendship.status = 'accepted';
      await friendship.save();
      
      await friendship.populate('requester', 'fullName username avatar');
      await friendship.populate('recipient', 'fullName username avatar');

      const requester = friendship.requester as unknown as IUser;
      const recipient = friendship.recipient as unknown as IUser;

      // Create conversation if it doesn't exist
      let conversation = await Conversation.findOne({
        participants: { $all: [requester._id, recipient._id], $size: 2 }
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [requester._id, recipient._id]
        });
      }

      // Send auto "hi" message from the person who accepted (recipient)
      const welcomeMessage = await Message.create({
        conversation: conversation._id,
        sender: userId, // The person who accepted
        content: 'Hi! 👋',
        readBy: [userId]
      });

      // Populate sender for Socket.IO
      await welcomeMessage.populate('sender', 'fullName username avatar');

      // Update conversation's last message
      await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessage: welcomeMessage._id,
        lastMessageAt: new Date()
      });

      // Emit message to requester via Socket.IO if they're online
      if (ioInstance) {
        const requesterId = (requester._id as any).toString();
        ioInstance.to(`user:${requesterId}`).emit('new_message', {
          id: welcomeMessage._id,
          conversationId: (conversation._id as any).toString(),
          content: welcomeMessage.content,
          sender: {
            id: (welcomeMessage.sender as any)._id,
            name: (welcomeMessage.sender as any).fullName,
            username: (welcomeMessage.sender as any).username,
            avatar: (welcomeMessage.sender as any).avatar
          },
          isSent: false,
          isRead: false,
          timestamp: welcomeMessage.createdAt
        });
      }

      // Create notification for requester
      await Notification.create({
        recipient: requester._id,
        sender: userId,
        type: 'friend_accept',
        title: 'Friend Request Accepted',
        message: `${recipient.fullName} accepted your friend request`,
        link: '/messages',
        relatedId: (conversation._id as any).toString()
      });

      // Delete the friend_request notification for the recipient
      await Notification.deleteOne({
        recipient: userId,
        relatedId: (friendship._id as any).toString(),
        type: 'friend_request'
      });

      return res.json({
        message: 'Friend request accepted',
        friendship: {
          id: friendship._id,
          user: {
            id: requester._id,
            name: requester.fullName,
            username: requester.username,
            avatar: requester.avatar
          },
          friendsSince: friendship.updatedAt
        },
        conversationId: conversation._id
      });
    } else {
      // Reject the request - delete notification
      await Notification.deleteOne({
        recipient: userId,
        relatedId: requestId,
        type: 'friend_request'
      });
      await Friendship.deleteOne({ _id: requestId });
      return res.json({ message: 'Friend request rejected' });
    }
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ error: 'Invalid input', details: error.issues });
    }
    console.error('Respond to friend request error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Remove friend
router.delete('/friends/:friendshipId', requireAuth, async (req: any, res) => {
  try {
    const { friendshipId } = req.params;
    const userId = req.user.userId;

    const friendship = await Friendship.findOne({
      _id: friendshipId,
      status: 'accepted',
      $or: [
        { requester: userId },
        { recipient: userId }
      ]
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    await Friendship.deleteOne({ _id: friendshipId });

    return res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Check friendship status with another user
router.get('/friends/status/:username', requireAuth, async (req: any, res) => {
  try {
    const { username } = req.params;
    const userId = req.user.userId;

    const otherUser = await User.findOne({ username });
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Can't check friendship status with yourself
    if ((otherUser._id as any).toString() === userId) {
      return res.status(400).json({ error: 'Cannot check friendship status with yourself' });
    }

    const friendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: otherUser._id },
        { requester: otherUser._id, recipient: userId }
      ]
    });

    let status = 'not_friends';
    if (friendship) {
      status = friendship.status;
    }

    return res.json({
      status,
      friendshipId: friendship?._id
    });
  } catch (error) {
    console.error('Check friendship status error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get friend count
router.get('/friends/count', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.userId;

    const friendCount = await Friendship.countDocuments({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    });

    const pendingCount = await Friendship.countDocuments({
      recipient: userId,
      status: 'pending'
    });

    return res.json({
      friendCount,
      pendingRequestsCount: pendingCount
    });
  } catch (error) {
    console.error('Get friend count error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;