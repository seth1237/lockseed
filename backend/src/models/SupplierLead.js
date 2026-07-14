import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String },
    description: { type: String },
  },
  { _id: false }
);

const supplierLeadSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    country: { type: String },
    city: { type: String },
    website: { type: String },
    supplierType: {
      type: String,
      enum: ['manufacturer', 'distributor', 'both', 'other'],
      default: 'distributor',
    },
    categories: [{ type: String }],
    products: [productSchema],
    documentsReady: [{ type: String }],
    message: { type: String },
    status: {
      type: String,
      enum: ['new', 'reviewing', 'accepted', 'rejected'],
      default: 'new',
    },
  },
  { timestamps: true }
);

export const SupplierLead =
  mongoose.models.SupplierLead || mongoose.model('SupplierLead', supplierLeadSchema);
