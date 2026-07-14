import mongoose from 'mongoose';

const QuoteRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quotationId: { type: String, required: true, index: true },
    invoiceId: { type: String, index: true },
    status: {
      type: String,
      enum: ['pending', 'quoted', 'confirmed', 'invoiced', 'completed'],
      default: 'pending',
    },
    productId: String,
    productName: String,
    quantity: Number,
    unitPrice: Number,
    items: [
      {
        productId: String,
        productName: String,
        quantity: Number,
        unitPrice: Number,
      },
    ],
    clientLocation: String,
    notes: String,
  },
  { timestamps: true }
);

export const QuoteRequest =
  mongoose.models.QuoteRequest || mongoose.model('QuoteRequest', QuoteRequestSchema);
