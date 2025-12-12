import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // User association
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Razorpay details
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  razorpayPaymentId: {
    type: String,
    default: null,
    index: true
  },

  razorpaySignature: {
    type: String,
    default: null
  },

  // Payment details
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },

  currency: {
    type: String,
    default: 'INR',
    enum: ['INR']
  },

  // Payment status
  status: {
    type: String,
    enum: ['created', 'attempted', 'paid', 'failed', 'cancelled'],
    default: 'created',
    index: true
  },

  // Payment method used
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'emi', 'cod'],
    default: null
  },

  // Order details
  orderDetails: {
    receipt: {
      type: String,
      required: true
    },
    notes: {
      type: Map,
      of: String,
      default: {}
    }
  },

  // Service booking details
  bookingDetails: {
    services: [{
      serviceId: String,
      name: String,
      price: Number,
      quantity: Number,
      image: String
    }],
    totalAmount: Number,
    taxAmount: Number,
    bookingDate: Date,
    bookingSlot: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      phone: String
    }
  },

  // Payment metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    platform: String,
    device: String
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

  paidAt: {
    type: Date,
    default: null
  },

  failedAt: {
    type: Date,
    default: null
  },

  // Expiry (Razorpay orders expire after 30 minutes)
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better performance
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ razorpayOrderId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.amount / 100);
});

// Method to update payment status
paymentSchema.methods.updatePaymentStatus = function(status, paymentData = {}) {
  this.status = status;
  this.updatedAt = new Date();

  if (status === 'paid') {
    this.razorpayPaymentId = paymentData.payment_id;
    this.razorpaySignature = paymentData.signature;
    this.paymentMethod = paymentData.method;
    this.paidAt = new Date();
  } else if (status === 'failed') {
    this.failedAt = new Date();
  }

  return this.save();
};

// Static method to find active payments
paymentSchema.statics.findActivePayments = function(userId) {
  return this.find({
    user: userId,
    status: { $in: ['created', 'attempted'] },
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = function(userId) {
  return this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
