// models/Notification.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  sender?: Types.ObjectId;
  type: 'friend_request' | 'friend_accept' | 'job_alert' | 'system_message' | 'post_like' | 'post_comment';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  relatedId?: string; // For friend request ID, job ID, etc.
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['friend_request', 'friend_accept', 'job_alert', 'system_message', 'post_like', 'post_comment'],
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    link: {
      type: String
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    relatedId: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient queries
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
