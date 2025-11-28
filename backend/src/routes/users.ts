// routes/users.ts
import { Router } from 'express';
import { z } from 'zod';
import User from '../models/User';
import Post from '../models/post';
import Friendship from '../models/Friendship';
import { requireAuth } from '../middlewares/auth';
import { uploadAvatar, deleteFromCloudinary } from '../config/cloudinary';

const router = Router();

// Validation schema for profile update
const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().max(200).url().optional().or(z.literal('')),
  skills: z.array(z.string().max(50)).max(20).optional(),
});

// Get user profile by username
router.get('/users/:username', requireAuth, async (req: any, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.userId;

    const user = await User.findOne({ username }).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get friend count
    const friendCount = await Friendship.countDocuments({
      status: 'accepted',
      $or: [
        { requester: user._id },
        { recipient: user._id }
      ]
    });

    // Get post count
    const postCount = await Post.countDocuments({ author: user._id });

    // Get user's recent posts
    const posts = await Post.find({ 
      author: user._id,
      $or: [
        { visibility: 'public' },
        { visibility: 'friends', author: currentUserId }
      ]
    })
    .populate('author', 'fullName username avatar')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    const postsList = posts.map(post => ({
      id: post._id,
      author: {
        id: (post.author as any)._id,
        name: (post.author as any).fullName,
        username: (post.author as any).username,
        avatar: (post.author as any).avatar
      },
      content: post.content,
      image: post.image,
      timestamp: post.createdAt,
      likes: post.likes.length,
      comments: post.commentsCount || 0,
      shares: post.shares,
      isLiked: post.likes.some((like: any) => like.toString() === currentUserId),
      isBookmarked: false // TODO: Implement bookmarks
    }));

    // Check friendship status with current user
    let friendshipStatus = 'not_friends';
    if ((user._id as any).toString() !== currentUserId) {
      const friendship = await Friendship.findOne({
        $or: [
          { requester: currentUserId, recipient: user._id },
          { requester: user._id, recipient: currentUserId }
        ]
      });
      
      if (friendship) {
        friendshipStatus = friendship.status;
      }
    } else {
      friendshipStatus = 'self';
    }

    return res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        website: user.website,
        skills: user.skills || [],
        joinedAt: user.createdAt
      },
      stats: {
        friendCount,
        postCount
      },
      posts: postsList,
      friendshipStatus
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get current user's full profile
router.get('/profile/me', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get friend count
    const friendCount = await Friendship.countDocuments({
      status: 'accepted',
      $or: [
        { requester: userId },
        { recipient: userId }
      ]
    });

    // Get post count
    const postCount = await Post.countDocuments({ author: userId });

    // Get user's recent posts
    const posts = await Post.find({ author: userId })
    .populate('author', 'fullName username avatar')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    const postsList = posts.map(post => ({
      id: post._id,
      author: {
        id: (post.author as any)._id,
        name: (post.author as any).fullName,
        username: (post.author as any).username,
        avatar: (post.author as any).avatar
      },
      content: post.content,
      image: post.image,
      timestamp: post.createdAt,
      likes: post.likes.length,
      comments: post.commentsCount || 0,
      shares: post.shares,
      isLiked: post.likes.some((like: any) => like.toString() === userId),
      isBookmarked: false // TODO: Implement bookmarks
    }));

    return res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        website: user.website,
        skills: user.skills || [],
        joinedAt: user.createdAt
      },
      stats: {
        friendCount,
        postCount
      },
      posts: postsList,
      friendshipStatus: 'self'
    });
  } catch (error) {
    console.error('Get current user profile error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update current user's profile
router.put('/profile/me', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const updates = updateProfileSchema.parse(req.body);

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    const user = await User.findByIdAndUpdate(
      userId,
      cleanUpdates,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        website: user.website,
        skills: user.skills || [],
        joinedAt: user.createdAt
      }
    });
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ error: 'Invalid input', details: error.issues });
    }
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update user's profile picture
router.put('/profile/me/avatar', requireAuth, uploadAvatar.single('avatar'), async (req: any, res) => {
  try {
    const userId = req.user.userId;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No avatar file provided. Please select an image file.' });
    }
    
    // Get current user to check if they have an existing avatar
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      // Delete uploaded file if user not found
      if (req.file.filename) {
        await deleteFromCloudinary(req.file.filename);
      }
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete old avatar from Cloudinary if it exists and is not the default avatar
    if (currentUser.avatar && !currentUser.avatar.includes('api.dicebear.com')) {
      // Extract public ID from avatar URL
      const publicId = currentUser.avatar.split('/').pop()?.split('.')[0];
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (error) {
          console.error('Error deleting old avatar:', error);
          // Continue even if deletion fails
        }
      }
    }
    
    // Update user with new avatar URL
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: req.file.path },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    if (!user) {
      // Delete uploaded file if user update fails
      if (req.file.filename) {
        await deleteFromCloudinary(req.file.filename);
      }
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json({
      message: 'Profile picture updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        website: user.website,
        skills: user.skills || [],
        joinedAt: user.createdAt
      }
    });
  } catch (error: any) {
    // Delete uploaded file on error
    if (req.file && req.file.filename) {
      try {
        await deleteFromCloudinary(req.file.filename);
      } catch (deleteError) {
        console.error('Error deleting avatar after failed update:', deleteError);
      }
    }
    
    if (error.message === 'Only image files are allowed!') {
      return res.status(400).json({ error: error.message });
    }
    
    // Log detailed error information for debugging
    console.error('Update avatar error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // Return more specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Invalid input',
        details: error.message 
      });
    }
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Invalid input',
        details: error.issues 
      });
    }
    
    return res.status(500).json({ error: 'Server error' });
  }
});

// Search/Get all users with filters
router.get('/users', requireAuth, async (req: any, res) => {
  try {
    const currentUserId = req.user.userId;
    const searchQuery = (req.query.search as string || '').trim();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build search filter
    const filter: any = {
      _id: { $ne: currentUserId } // Exclude current user
    };

    if (searchQuery) {
      filter.$or = [
        { fullName: { $regex: searchQuery, $options: 'i' } },
        { username: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Get users
    const users = await User.find(filter)
      .select('fullName username email avatar bio location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get friendship statuses for all users
    const userIds = users.map(u => u._id);
    const friendships = await Friendship.find({
      $or: [
        { requester: currentUserId, recipient: { $in: userIds } },
        { requester: { $in: userIds }, recipient: currentUserId }
      ]
    }).lean();

    // Create a map of user ID to friendship status
    const friendshipMap = new Map();
    friendships.forEach(f => {
      const otherUserId = (f.requester as any).toString() === currentUserId 
        ? (f.recipient as any).toString() 
        : (f.requester as any).toString();
      friendshipMap.set(otherUserId, f.status);
    });

    // Format response
    const usersList = users.map(user => ({
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      friendshipStatus: friendshipMap.get((user._id as any).toString()) || 'not_friends'
    }));

    const total = await User.countDocuments(filter);

    return res.json({
      users: usersList,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;