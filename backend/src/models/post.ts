// models/Post.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPost extends Document {
  author: Types.ObjectId;
  content: string;
  image?: string;
  imagePublicId?: string; // Cloudinary public_id for deletion
  likes: Types.ObjectId[];
  likesCount: number;
  commentsCount: number;
  shares: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    author: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
    content: { 
      type: String, 
      required: true,
      maxlength: 2000 
    },
    image: { 
      type: String 
    },
    imagePublicId: {
      type: String
    },
    likes: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      default: [] 
    }],
    likesCount: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    shares: { 
      type: Number, 
      default: 0 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true }
  }
);

// Virtual for like count
PostSchema.virtual('likeCount').get(function() {
  return this.likesCount;
});

// Virtual for comment count
PostSchema.virtual('commentCount').get(function() {
  return this.commentsCount;
});

// Index for better query performance
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ likes: 1 });

export default mongoose.model<IPost>('Post', PostSchema);