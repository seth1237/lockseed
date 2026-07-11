import mongoose, { Schema, type Document, type Model, Types } from 'mongoose';

export interface IPasswordReset extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const PasswordReset: Model<IPasswordReset> =
  mongoose.models.PasswordReset ??
  mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema);
