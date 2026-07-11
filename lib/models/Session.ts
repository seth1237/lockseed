import mongoose, { Schema, type Document, type Model, Types } from 'mongoose';

export interface ISession extends Document {
  userId: Types.ObjectId;
  refreshTokenHash: string;
  expiresAt: Date;
  device?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    device: { type: String },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

export const Session: Model<ISession> =
  mongoose.models.Session ?? mongoose.model<ISession>('Session', SessionSchema);
