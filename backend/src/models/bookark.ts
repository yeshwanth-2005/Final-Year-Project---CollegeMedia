// models/Bookmark.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBookmark extends Document {
  user: Types.ObjectId;
  post: Types.ObjectId;
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    post: { 
      type: Schema.Types.ObjectId, 
      ref: 'Post', 
      required: true 
    }
  },
  { 
    timestamps: true 
  }
);

// Ensure unique bookmarks
BookmarkSchema.index({ user: 1, post: 1 }, { unique: true });

export default mongoose.model<IBookmark>('Bookmark', BookmarkSchema);