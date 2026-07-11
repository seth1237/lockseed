import mongoose, { Schema, type Document, type Model, Types } from 'mongoose';

export type QuoteStatus = 'pending' | 'quoted' | 'confirmed' | 'invoiced' | 'completed';

export interface IQuoteRequest extends Document {
  userId: Types.ObjectId;
  quotationId: string;
  invoiceId?: string;
  status: QuoteStatus;
  productId?: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  clientLocation?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuoteRequestSchema = new Schema<IQuoteRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quotationId: { type: String, required: true, index: true },
    invoiceId: { type: String, index: true },
    status: {
      type: String,
      enum: ['pending', 'quoted', 'confirmed', 'invoiced', 'completed'],
      default: 'pending',
    },
    productId: { type: String },
    productName: { type: String },
    quantity: { type: Number },
    unitPrice: { type: Number },
    clientLocation: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const QuoteRequest: Model<IQuoteRequest> =
  mongoose.models.QuoteRequest ??
  mongoose.model<IQuoteRequest>('QuoteRequest', QuoteRequestSchema);
