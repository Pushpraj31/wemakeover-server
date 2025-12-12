import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  // Service Information (stored directly, not referenced)
  serviceId: {
    type: String, // Changed from ObjectId to String
    required: true,
    trim: true
    // Removed ref: 'Service' since we're using string IDs
  },
  
  cardHeader: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  price: {
    type: Number,
    required: [true, 'Service price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  img: {
    type: String,
    required: [true, 'Service image is required'],
    trim: true
  },
  
  duration: {
    type: String,
    default: null,
    trim: true
  },
  
  taxIncluded: {
    type: Boolean,
    default: true
  },
  
  category: {
    type: String,
    required: [true, 'Service category is required'],
    trim: true,
    enum: {
      values: ['Regular', 'Premium', 'Bridal', 'Classic', 'default'],
      message: 'Category must be one of: Regular, Premium, Bridal, Classic, default'
    }
  },
  
  serviceType: {
    type: String,
    default: 'Standard',
    trim: true,
    enum: {
      values: ['Standard', 'Premium', 'Deluxe'],
      message: 'Service type must be one of: Standard, Premium, Deluxe'
    }
  },
  
  // Cart-specific fields
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [10, 'Quantity cannot exceed 10']
  },
  
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  
  // Timestamps
  addedAt: {
    type: Date,
    default: Date.now
  },
  
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  _id: false // Disable _id for subdocuments
});

const cartSchema = new mongoose.Schema({
  // User association
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Cart items
  items: [cartItemSchema],
  
  // Cart summary
  summary: {
    totalServices: {
      type: Number,
      default: 0,
      min: [0, 'Total services cannot be negative']
    },
    
    totalItems: {
      type: Number,
      default: 0,
      min: [0, 'Total items cannot be negative']
    },
    
    subtotal: {
      type: Number,
      default: 0,
      min: [0, 'Subtotal cannot be negative']
    },
    
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative']
    },
    
    total: {
      type: Number,
      default: 0,
      min: [0, 'Total cannot be negative']
    }
  },
  
  // Cart status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  expiresAt: {
    type: Date,
    default: function() {
      // Cart expires after 30 days
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    },
    index: { expireAfterSeconds: 0 }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better performance
cartSchema.index({ user: 1, isActive: 1 });
cartSchema.index({ lastUpdated: -1 });
cartSchema.index({ expiresAt: 1 });

// Pre-save middleware to update cart summary and timestamps
cartSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.lastUpdated = new Date();
  
  // Recalculate summary
  this.summary.totalServices = this.items.length;
  this.summary.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.summary.subtotal = this.items.reduce((total, item) => total + item.subtotal, 0);
  this.summary.taxAmount = this.summary.subtotal * 0.18; // 18% GST
  this.summary.total = this.summary.subtotal + this.summary.taxAmount;
  
  next();
});

// Instance methods
cartSchema.methods.addItem = function(itemData) {
  const existingItemIndex = this.items.findIndex(item => item.serviceId === itemData.serviceId);
  
  if (existingItemIndex !== -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += 1;
    this.items[existingItemIndex].subtotal = this.items[existingItemIndex].price * this.items[existingItemIndex].quantity;
    this.items[existingItemIndex].lastModified = new Date();
  } else {
    // Add new item
    const newItem = {
      ...itemData,
      quantity: 1,
      subtotal: itemData.price * 1,
      addedAt: new Date(),
      lastModified: new Date()
    };
    this.items.push(newItem);
  }
  
  return this.save();
};

cartSchema.methods.updateItemQuantity = function(serviceId, quantity) {
  const item = this.items.find(item => item.serviceId === serviceId);
  
  if (!item) {
    throw new Error('Item not found in cart');
  }
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    this.items = this.items.filter(item => item.serviceId !== serviceId);
  } else {
    item.quantity = quantity;
    item.subtotal = item.price * quantity;
    item.lastModified = new Date();
  }
  
  return this.save();
};

cartSchema.methods.removeItem = function(serviceId) {
  this.items = this.items.filter(item => item.serviceId !== serviceId);
  return this.save();
};

cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

cartSchema.methods.isEmpty = function() {
  return this.items.length === 0;
};

// Virtual for cart status
cartSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Static methods
cartSchema.statics.findByUser = function(userId) {
  return this.findOne({ user: userId, isActive: true });
};

cartSchema.statics.findActiveCarts = function() {
  return this.find({ isActive: true });
};

// Ensure virtual fields are serialized
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
