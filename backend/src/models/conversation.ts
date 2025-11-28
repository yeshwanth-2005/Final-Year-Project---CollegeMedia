// models/Conversation.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message'
    },
    lastMessageAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure unique conversations between two users
ConversationSchema.index({ participants: 1 }, { unique: false });
ConversationSchema.index({ participants: 1, lastMessageAt: -1 });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);

