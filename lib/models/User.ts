import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IUser extends Document {
  erpClientId?: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  emailVerified: boolean;
  status: 'active' | 'suspended';
  company?: string;
  country?: string;
  address?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    erpClientId: { type: String, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    company: { type: String, trim: true },
    country: { type: String, trim: true },
    address: { type: String, trim: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema);
