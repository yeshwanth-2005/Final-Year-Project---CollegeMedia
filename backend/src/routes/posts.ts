import { Router } from 'express';
import { z } from 'zod';
import Post from '../models/post';
import Comment from '../models/comment';
import User from '../models/User';
import { requireAuth } from '../middlewares/auth';
import { uploadPost, deleteFromCloudinary } from '../config/cloudinary';
import { createNotification } from '../utils/notificationHelper';

const router = Router();

// Validation schemas
const createPostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content too long'),
});

const updatePostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content too long').optional(),
});

const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment is required').max(1000, 'Comment too long'),
});

const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment is required').max(1000, 'Comment too long'),
});

// CREATE - Create a new post with optional image
router.post('/posts', requireAuth, uploadPost.single('image'), async (req: any, res) => {
  try {
    const userId = req.user.userId;
    
    // Parse and validate request body
    const { content } = createPostSchema.parse(req.body);

    // Get image data from Cloudinary upload (if exists)
    const imageUrl = req.file ? (req.file as any).path : undefined;
    const imagePublicId = req.file ? (req.file as any).filename : undefined;

    // Create post
    const post = await Post.create({
      author: userId,
      content,
      image: imageUrl,
      imagePublicId,
      likes: [],
      likesCount: 0,
      commentsCount: 0,
      shares: 0,
    });

    // Populate author details
    await post.populate('author', 'fullName username avatar');

    return res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: post._id,
        content: post.content,
        image: post.image,
        author: {
          id: (post.author as any)._id,
          name: (post.author as any).fullName,
          username: (post.author as any).username,
          avatar: (post.author as any).avatar,
        },
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        shares: post.shares,
        isLiked: false,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    });
  } catch (error: any) {
    // Delete uploaded image if post creation fails
    if (req.file && (req.file as any).filename) {
      try {
        await deleteFromCloudinary((req.file as any).filename);
      } catch (deleteError) {
        console.error('Error deleting image after failed post creation:', deleteError);
      }
    }

    if (error?.issues) {
      return res.status(400).json({ error: 'Invalid input', details: error.issues });
    }
    if (error.message === 'Only image files are allowed!') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Create post error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// READ - Get all posts (feed)
router.get('/posts', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get all posts (no visibility filter)
    const posts = await Post.find({})
      .populate('author', 'fullName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments({});

    const postsList = posts.map((post: any) => ({
      id: post._id,
      content: post.content,
      image: post.image,
      author: {
        id: post.author._id,
        name: post.author.fullName,
        username: post.author.username,
        avatar: post.author.avatar,
      },
      likesCount: post.likesCount || 0,
      commentsCount: post.commentsCount || 0,
      shares: post.shares,
      isLiked: post.likes.includes(userId),
      isOwnPost: post.author._id.toString() === userId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    return res.json({
      posts: postsList,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// READ - Get single post by ID
router.get('/posts/:postId', requireAuth, async (req: any, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(postId)
      .populate('author', 'fullName username avatar')
      .lean();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.json({
      post: {
        id: post._id,
        content: post.content,
        image: post.image,
        author: {
          id: (post.author as any)._id,
          name: (post.author as any).fullName,
          username: (post.author as any).username,
          avatar: (post.author as any).avatar,
        },
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        shares: post.shares,
        isLiked: post.likes.includes(userId),
        isOwnPost: (post.author as any)._id.toString() === userId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE - Update post with optional image replacement
router.put('/posts/:postId', requireAuth, uploadPost.single('image'), async (req: any, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Find post
    const post = await Post.findById(postId);

    if (!post) {
      // Clean up uploaded image if post doesn't exist
      if (req.file && (req.file as any).filename) {
        await deleteFromCloudinary((req.file as any).filename);
      }
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check ownership
    if (post.author.toString() !== userId) {
      // Clean up uploaded image if not authorized
      if (req.file && (req.file as any).filename) {
        await deleteFromCloudinary((req.file as any).filename);
      }
      return res.status(403).json({ error: 'You can only update your own posts' });
    }

    // Validate update data
    const updateData = updatePostSchema.parse(req.body);

    // Update content if provided
    if (updateData.content) {
      post.content = updateData.content;
    }

    // Handle image replacement
    if (req.file) {
      const newImageUrl = (req.file as any).path;
      const newImagePublicId = (req.file as any).filename;

      // Delete old image from Cloudinary if exists
      if (post.imagePublicId) {
        try {
          await deleteFromCloudinary(post.imagePublicId);
        } catch (error) {
          console.error('Error deleting old image:', error);
          // Continue even if deletion fails
        }
      }

      // Update with new image
      post.image = newImageUrl;
      post.imagePublicId = newImagePublicId;
    }

    await post.save();

    // Populate author details
    await post.populate('author', 'fullName username avatar');

    return res.json({
      message: 'Post updated successfully',
      post: {
        id: post._id,
        content: post.content,
        image: post.image,
        author: {
          id: (post.author as any)._id,
          name: (post.author as any).fullName,
          username: (post.author as any).username,
          avatar: (post.author as any).avatar,
        },
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        shares: post.shares,
        isLiked: post.likes.includes(userId),
        isOwnPost: true,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    });
  } catch (error: any) {
    // Clean up uploaded image on error
    if (req.file && (req.file as any).filename) {
      try {
        await deleteFromCloudinary((req.file as any).filename);
      } catch (deleteError) {
        console.error('Error deleting image after failed update:', deleteError);
      }
    }

    if (error?.issues) {
      return res.status(400).json({ error: 'Invalid input', details: error.issues });
    }
    console.error('Update post error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE - Delete post and its Cloudinary image
router.delete('/posts/:postId', requireAuth, async (req: any, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Find post
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check ownership
    if (post.author.toString() !== userId) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    // Delete image from Cloudinary if exists
    if (post.imagePublicId) {
      try {
        await deleteFromCloudinary(post.imagePublicId);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        // Continue with post deletion even if image deletion fails
      }
    }

    // Delete post
    await Post.deleteOne({ _id: postId });

    return res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE - Delete image from post
router.delete('/posts/:postId/image', requireAuth, async (req: any, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Find post
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check ownership
    if (post.author.toString() !== userId) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    // Check if post has an image
    if (!post.image || !post.imagePublicId) {
      return res.status(400).json({ error: 'Post has no image to delete' });
    }

    // Delete image from Cloudinary
    try {
      await deleteFromCloudinary(post.imagePublicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      // Continue with post update even if image deletion fails
    }

    // Remove image from post
    post.image = undefined;
    post.imagePublicId = undefined;
    await post.save();

    return res.json({ 
      message: 'Image deleted successfully',
      post: {
        id: post._id,
        content: post.content,
        image: post.image,
        author: {
          id: (post.author as any)._id,
          name: (post.author as any).fullName,
          username: (post.author as any).username,
          avatar: (post.author as any).avatar,
        },
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        shares: post.shares,
        isLiked: post.likes.includes(userId),
        isOwnPost: true,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      }
    });
  } catch (error) {
    console.error('Delete image error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// LIKE/UNLIKE - Toggle like on a post
router.post('/posts/:postId/like', requireAuth, async (req: any, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user already liked the post
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike: Remove user from likes array and decrement count
      await Post.findByIdAndUpdate(postId, {
        $pull: { likes: userId },
        $inc: { likesCount: -1 }
      });
    } else {
      // Like: Add user to likes array and increment count
      await Post.findByIdAndUpdate(postId, {
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 }
      });

      // Send notification to post author (if it's not their own post)
      if (post.author.toString() !== userId) {
        const liker = await User.findById(userId).select('fullName username');
        if (liker) {
          await createNotification({
            recipient: post.author.toString(),
            sender: userId,
            type: 'post_like',
            title: 'New like on your post',
            message: `${liker.fullName} liked your post`,
            link: `/posts/${postId}`,
            relatedId: postId
          });
        }
      }
    }

    // Get updated like count
    const updatedPost = await Post.findById(postId);
    const updatedLikesCount = updatedPost?.likesCount || 0;

    return res.json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      likesCount: updatedLikesCount,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error('Like post error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// CREATE - Add comment to post
router.post('/posts/:postId/comments', requireAuth, async (req: any, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    const { content } = createCommentSchema.parse(req.body);

    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create comment
    const comment = await Comment.create({
      post: postId,
      author: userId,
      content
    });

    // Populate author details
    await comment.populate('author', 'fullName username avatar');

    // Increment comment count on post
    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 }
    });

    // Send notification to post author (if it's not their own post)
    if (post.author.toString() !== userId) {
      const commenter = await User.findById(userId).select('fullName username');
      if (commenter) {
        await createNotification({
          recipient: post.author.toString(),
          sender: userId,
          type: 'post_comment',
          title: 'New comment on your post',
          message: `${commenter.fullName} commented on your post`,
          link: `/posts/${postId}`,
          relatedId: postId
        });
      }
    }

    return res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        id: comment._id,
        content: comment.content,
        author: {
          id: (comment.author as any)._id,
          name: (comment.author as any).fullName,
          username: (comment.author as any).username,
          avatar: (comment.author as any).avatar,
        },
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        isOwnComment: true
      }
    });
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ error: 'Invalid input', details: error.issues });
    }
    console.error('Add comment error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// READ - Get comments for a post (paginated)
router.get('/posts/:postId/comments', requireAuth, async (req: any, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get comments
    const comments = await Comment.find({ post: postId })
      .populate('author', 'fullName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Comment.countDocuments({ post: postId });

    const commentsList = comments.map((comment: any) => ({
      id: comment._id,
      content: comment.content,
      author: {
        id: comment.author._id,
        name: comment.author.fullName,
        username: comment.author.username,
        avatar: comment.author.avatar,
      },
      isOwnComment: comment.author._id.toString() === userId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));

    return res.json({
      comments: commentsList,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE - Update comment
router.put('/comments/:commentId', requireAuth, async (req: any, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;
    const { content } = updateCommentSchema.parse(req.body);

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check ownership
    if (comment.author.toString() !== userId) {
      return res.status(403).json({ error: 'You can only update your own comments' });
    }

    // Update comment
    comment.content = content;
    await comment.save();

    // Populate author details
    await comment.populate('author', 'fullName username avatar');

    return res.json({
      message: 'Comment updated successfully',
      comment: {
        id: comment._id,
        content: comment.content,
        author: {
          id: (comment.author as any)._id,
          name: (comment.author as any).fullName,
          username: (comment.author as any).username,
          avatar: (comment.author as any).avatar,
        },
        isOwnComment: true,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      }
    });
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ error: 'Invalid input', details: error.issues });
    }
    console.error('Update comment error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE - Delete comment
router.delete('/comments/:commentId', requireAuth, async (req: any, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check ownership
    if (comment.author.toString() !== userId) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    // Delete comment
    await Comment.deleteOne({ _id: commentId });

    // Decrement comment count on associated post
    await Post.findByIdAndUpdate(comment.post, {
      $inc: { commentsCount: -1 }
    });

    return res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET - Get user's posts
router.get('/users/:username/posts', requireAuth, async (req: any, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isOwnProfile = (user._id as any).toString() === currentUserId;

    // Get all user posts (no visibility filter)
    const posts = await Post.find({
      author: user._id,
    })
      .populate('author', 'fullName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments({
      author: user._id,
    });

    const postsList = posts.map((post: any) => ({
      id: post._id,
      content: post.content,
      image: post.image,
      author: {
        id: post.author._id,
        name: post.author.fullName,
        username: post.author.username,
        avatar: post.author.avatar,
      },
      likesCount: post.likesCount || 0,
      commentsCount: post.commentsCount || 0,
      shares: post.shares,
      isLiked: post.likes.includes(currentUserId),
      isOwnPost: post.author._id.toString() === currentUserId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    return res.json({
      posts: postsList,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
