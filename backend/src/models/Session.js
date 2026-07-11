import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    device: String,
    ipAddress: String,
  },
  { timestamps: true }
);

export const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);
