import mongoose from 'mongoose';

export interface IProduct extends mongoose.Document {
  name: string;
  sku: string;
  category: string;
  description?: string;
  currentStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  unitPrice: number;
  supplier: string;
  location: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
  lastRestocked?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new mongoose.Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  reorderLevel: {
    type: Number,
    required: true,
    min: 0,
    default: 10,
  },
  reorderQuantity: {
    type: Number,
    required: true,
    min: 1,
    default: 50,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  supplier: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['in-stock', 'low-stock', 'out-of-stock', 'discontinued'],
    default: 'in-stock',
  },
  lastRestocked: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Update status based on stock levels
ProductSchema.pre('save', function(next) {
  if (this.currentStock === 0) {
    this.status = 'out-of-stock';
  } else if (this.currentStock <= this.reorderLevel) {
    this.status = 'low-stock';
  } else if (this.status !== 'discontinued') {
    this.status = 'in-stock';
  }
  next();
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
