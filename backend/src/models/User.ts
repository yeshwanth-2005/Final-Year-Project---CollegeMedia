// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  dob?: Date;
  bio?: string;
  location?: string;
  website?: string;
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    avatar: { 
      type: String, 
      default: function(this: any) {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.username}`;
      }
    },
    dob: { type: Date },
    bio: { type: String, maxlength: 500 },
    location: { type: String, maxlength: 100 },
    website: { type: String, maxlength: 200 },
    skills: [{ type: String, maxlength: 50 }],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for friends count
UserSchema.virtual('friendCount').get(function() {
  return 0; // This will be populated when needed
});

// Virtual for pending requests count
UserSchema.virtual('pendingRequestsCount').get(function() {
  return 0; // This will be populated when needed
});

export default mongoose.model<IUser>('User', UserSchema);