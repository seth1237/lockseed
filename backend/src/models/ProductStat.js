import mongoose from 'mongoose';

const ProductStatSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true, index: true },
    productName: { type: String, required: true },
    image: { type: String },
    unitPrice: { type: Number, default: 0 },
    category: { type: String },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ProductStat =
  mongoose.models.ProductStat || mongoose.model('ProductStat', ProductStatSchema);
