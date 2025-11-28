// routes/notifications.ts
import { Router } from 'express';
import Notification from '../models/notification';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// Get all notifications for current user
router.get('/notifications', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'fullName username avatar')
      .sort({ type: -1, createdAt: -1 }) // Friend requests first, then by date
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments({ recipient: userId });
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      isRead: false 
    });

    const formattedNotifications = notifications.map(notif => ({
      id: notif._id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      link: notif.link,
      isRead: notif.isRead,
      relatedId: notif.relatedId,
      sender: notif.sender ? {
        id: (notif.sender as any)._id,
        fullName: (notif.sender as any).fullName,
        username: (notif.sender as any).username,
        avatar: (notif.sender as any).avatar
      } : null,
      createdAt: notif.createdAt
    }));

    return res.json({
      notifications: formattedNotifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Delete notification
router.delete('/notifications/:id', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Delete all read notifications
router.delete('/notifications/read/clear', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.userId;

    await Notification.deleteMany({
      recipient: userId,
      isRead: true
    });

    return res.json({ message: 'Read notifications cleared' });
  } catch (error) {
    console.error('Clear notifications error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
