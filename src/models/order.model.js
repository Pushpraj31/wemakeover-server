import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // User association
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Order identification
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },

  // Payment reference (optional for COD orders)
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: false, // Optional for COD orders
    default: null
  },

  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },

  // Service details
  services: [{
    serviceId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    image: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['Regular', 'Premium', 'Bridal', 'Classic', 'default'],
      required: true
    },
    duration: {
      type: String,
      default: null
    }
  }],

  // Pricing breakdown
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    taxAmount: {
      type: Number,
      required: true,
      min: [0, 'Tax amount cannot be negative']
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },

  // Booking details
  booking: {
    date: {
      type: Date,
      required: true
    },
    slot: {
      type: String,
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true
    },
    address: {
      street: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      pincode: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      landmark: {
        type: String,
        default: null
      }
    },
    notes: {
      type: String,
      default: null
    }
  },

  // Service provider details (for future use)
  provider: {
    assigned: {
      type: Boolean,
      default: false
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      default: null
    },
    providerName: {
      type: String,
      default: null
    },
    providerPhone: {
      type: String,
      default: null
    }
  },

  // Order timeline
  timeline: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: null
    },
    updatedBy: {
      type: String,
      enum: ['system', 'user', 'admin', 'provider'],
      default: 'system'
    }
  }],

  // Customer feedback
  feedback: {
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: null
    },
    comment: {
      type: String,
      default: null
    },
    submittedAt: {
      type: Date,
      default: null
    }
  },

  // Cancellation details
  cancellation: {
    reason: {
      type: String,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    cancelledBy: {
      type: String,
      enum: ['user', 'admin', 'provider'],
      default: null
    },
    refundAmount: {
      type: Number,
      default: null
    },
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: null
    }
  },

  // Payment status tracking (for COD orders)
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },

  // Metadata
  metadata: {
    source: {
      type: String,
      default: 'web'
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'cod'],
      default: 'online'
    },
    userAgent: String,
    ipAddress: String,
    referrer: String
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better performance
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'booking.date': 1, status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1 }); // Index for payment status queries
orderSchema.index({ 'metadata.paymentMethod': 1 }); // Index for COD/Online filtering

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus, note = null, updatedBy = 'system') {
  this.status = newStatus;
  this.updatedAt = new Date();

  // Add to timeline
  this.timeline.push({
    status: newStatus,
    timestamp: new Date(),
    note: note,
    updatedBy: updatedBy
  });

  // Set completion date if status is completed
  if (newStatus === 'completed') {
    this.completedAt = new Date();
  }

  return this.save();
};

// Method to calculate total duration
orderSchema.methods.getTotalDuration = function() {
  return this.services.reduce((total, service) => {
    return total + (service.duration || 60) * service.quantity; // Default 60 minutes per service
  }, 0);
};

// Virtual for formatted total amount
orderSchema.virtual('formattedTotal').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.pricing.totalAmount);
});

// Static method to find orders by date range
orderSchema.statics.findByDateRange = function(startDate, endDate, status = null) {
  const query = {
    'booking.date': {
      $gte: startDate,
      $lte: endDate
    }
  };

  if (status) {
    query.status = status;
  }

  return this.find(query).populate('user payment').sort({ 'booking.date': 1 });
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = function(userId = null) {
  const matchStage = userId ? { user: new mongoose.Types.ObjectId(userId) } : {};

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.totalAmount' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
