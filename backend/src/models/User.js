import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
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

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
