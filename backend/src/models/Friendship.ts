// models/Friendship.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFriendship extends Document {
  requester: Types.ObjectId;
  recipient: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

const FriendshipSchema = new Schema<IFriendship>(
  {
    requester: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    recipient: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending',
      required: true 
    }
  },
  { 
    timestamps: true 
  }
);

// Compound index for unique friendship requests
FriendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });
FriendshipSchema.index({ recipient: 1, status: 1 });
FriendshipSchema.index({ requester: 1, status: 1 });

export default mongoose.model<IFriendship>('Friendship', FriendshipSchema);