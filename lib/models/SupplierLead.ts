import mongoose, { Schema, models, model } from 'mongoose';

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String },
    description: { type: String },
  },
  { _id: false }
);

const supplierLeadSchema = new Schema(
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

export type SupplierLeadDoc = {
  _id: mongoose.Types.ObjectId;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  country?: string;
  city?: string;
  website?: string;
  supplierType: string;
  categories: string[];
  products: { name: string; category?: string; description?: string }[];
  documentsReady: string[];
  message?: string;
  status: 'new' | 'reviewing' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
};

export const SupplierLead =
  models.SupplierLead || model('SupplierLead', supplierLeadSchema);
