import mongoose from 'mongoose';
import { sendBookingNotificationToAdmin } from '../services/email.service.js';
import { combineDateAndSlot } from '../utils/bookingTime.utils.js';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Service price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Service quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  category: {
    type: String,
    enum: ['facial', 'waxing', 'massage', 'manicure', 'pedicure', 'hair', 'other', 'Regular'],
    default: 'other'
  },
  duration: {
    type: Number, // Duration in minutes
    default: 45
  }
}, { _id: false });

const addressSchema = new mongoose.Schema({
  houseFlatNumber: {
    type: String,
    required: false, // Made optional for flexibility
    trim: true
  },
  streetAreaName: {
    type: String,
    required: false, // Made optional for flexibility
    trim: true
  },
  completeAddress: {
    type: String,
    required: false, // Made optional for flexibility
    trim: true
  },
  landmark: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    match: [/^[1-9][0-9]{5}$/, 'Please provide a valid 6-digit pincode']
  },
  country: {
    type: String,
    default: 'India',
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit phone number']
  }
}, { _id: false });

// Add custom validation to ensure we have at least basic address info
addressSchema.pre('validate', function(next) {
  // Check if we have either completeAddress OR (city AND state)
  const hasCompleteAddress = this.completeAddress && this.completeAddress.trim().length > 0;
  const hasBasicInfo = this.city && this.state && this.city.trim().length > 0 && this.state.trim().length > 0;
  
  if (!hasCompleteAddress && !hasBasicInfo) {
    const error = new Error('Either complete address or city and state are required');
    error.name = 'ValidationError';
    return next(error);
  }
  
  next();
});

const bookingSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  services: {
    type: [serviceSchema],
    required: [true, 'Services are required'],
    validate: {
      validator: function(services) {
        return services && services.length > 0;
      },
      message: 'At least one service is required'
    }
  },
  bookingDetails: {
    date: {
      type: Date,
      required: [true, 'Booking date is required'],
      validate: {
        validator: function(date) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date >= today;
        },
        message: 'Booking date cannot be in the past'
      }
    },
    slot: {
      type: String,
      required: [true, 'Booking slot is required'],
      trim: true
    },
    duration: {
      type: Number, // Total duration in minutes
      required: [true, 'Booking duration is required'],
      min: [15, 'Minimum booking duration is 15 minutes']
    },
    address: {
      type: addressSchema,
      required: [true, 'Booking address is required']
    }
  },
  pricing: {
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    },
    taxAmount: {
      type: Number,
      required: [true, 'Tax amount is required'],
      min: [0, 'Tax amount cannot be negative'],
      default: 0
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR'],
      uppercase: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
    required: true
  },
  paymentDetails: {
    razorpayOrderId: {
      type: String,
      trim: true
    },
    razorpayPaymentId: {
      type: String,
      trim: true
    },
    razorpaySignature: {
      type: String,
      trim: true
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'cod', 'wallet', 'upi', 'card', 'netbanking'],
      default: 'online'
    },
    paidAt: {
      type: Date
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: [0, 'Refund amount cannot be negative']
    },
    refundedAt: {
      type: Date
    }
  },
  cancellationDetails: {
    cancelledAt: {
      type: Date
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'admin', 'system'],
      default: 'customer'
    },
    cancellationReason: {
      type: String,
      trim: true
    },
    refundEligible: {
      type: Boolean,
      default: false
    }
  },
  reschedulingDetails: {
    originalDate: {
      type: Date
    },
    originalSlot: {
      type: String
    },
    rescheduledAt: {
      type: Date
    },
    rescheduledBy: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    },
    rescheduleReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Reschedule reason cannot exceed 500 characters']
    },
    rescheduleCount: {
      type: Number,
      default: 0,
      max: [3, 'Maximum 3 reschedules allowed']
    }
  },
  notes: {
    customer: {
      type: String,
      trim: true,
      maxlength: [500, 'Customer notes cannot exceed 500 characters']
    },
    admin: {
      type: String,
      trim: true,
      maxlength: [500, 'Admin notes cannot exceed 500 characters']
    }
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'admin'],
      default: 'web'
    },
    userAgent: {
      type: String,
      trim: true
    },
    ipAddress: {
      type: String,
      trim: true
    },
    referralSource: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ orderNumber: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'bookingDetails.date': 1 });
bookingSchema.index({ 'paymentStatus': 1 });
bookingSchema.index({ createdAt: -1 });

// Virtual for total duration
bookingSchema.virtual('totalDuration').get(function() {
  return this.services.reduce((total, service) => total + (service.duration * service.quantity), 0);
});

// Virtual for isUpcoming
bookingSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const bookingDateTime = new Date(this.bookingDetails.date);
  return bookingDateTime > now;
});

// Virtual for isPast
bookingSchema.virtual('isPast').get(function() {
  const now = new Date();
  const bookingDateTime = new Date(this.bookingDetails.date);
  return bookingDateTime <= now;
});

// Virtual for canBeCancelled
bookingSchema.virtual('canBeCancelled').get(function() {
  if (['cancelled', 'completed', 'no_show'].includes(this.status)) {
    return false;
  }
  
  const now = new Date();
  const bookingDateTime = combineDateAndSlot(
    this.bookingDetails?.date,
    this.bookingDetails?.slot
  );
  if (!bookingDateTime) {
    return false;
  }
  const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
  
  return hoursUntilBooking > 2; // Can cancel if more than 2 hours before booking
});

// Virtual for canBeRescheduled
bookingSchema.virtual('canBeRescheduled').get(function() {
  // Check if status is active (not cancelled, completed, or no_show)
  if (['cancelled', 'completed', 'no_show'].includes(this.status)) {
    return false;
  }
  
  // Check if reschedule limit (3) has been reached
  if (this.reschedulingDetails.rescheduleCount >= 3) {
    return false;
  }
  
  // Check if booking is more than 48 hours away
  const now = new Date();
  const bookingDateTime = combineDateAndSlot(
    this.bookingDetails?.date,
    this.bookingDetails?.slot
  );
  if (!bookingDateTime) {
    return false;
  }
  const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
  
  return hoursUntilBooking > 4; // Can reschedule if more than 4 hours before booking
});

// Pre-save middleware to generate order number
bookingSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.orderNumber = `BOOK-${new Date().getFullYear()}-${timestamp}-${random.toString().padStart(4, '0')}`;
  }
  next();
});

// Pre-save middleware to calculate pricing
bookingSchema.pre('save', function(next) {
  if (this.isModified('services')) {
    this.pricing.subtotal = this.services.reduce((total, service) => {
      return total + (service.price * service.quantity);
    }, 0);
    
    this.pricing.taxAmount = Math.round(this.pricing.subtotal * 0.18); // 18% GST
    this.pricing.totalAmount = this.pricing.subtotal + this.pricing.taxAmount;
  }
  next();
});

// Post-save middleware to send email notification to admin after booking is created
bookingSchema.post('save', async function(doc, next) {
  try {
    console.log('🔔 Booking saved! Sending notification email to admin...');
    
    // Populate userId to get customer details for email
    await doc.populate('userId', 'name email phone');
    
    // Send email notification to admin (non-blocking)
    // Using setImmediate to not block the save operation
    setImmediate(async () => {
      try {
        await sendBookingNotificationToAdmin(doc);
        console.log('✅ Admin notification email queued successfully for order:', doc.orderNumber);
      } catch (emailError) {
        console.error('❌ Failed to send admin notification email:', emailError);
        // Don't throw - we don't want to fail the booking if email fails
      }
    });
  } catch (error) {
    console.error('⚠️ Error in post-save email notification:', error);
    // Don't throw error - booking should succeed even if email fails
  }
  
  if (next) next();
});

// Instance methods
bookingSchema.methods.cancelBooking = function(reason, cancelledBy = 'customer') {
  this.status = 'cancelled';
  this.cancellationDetails = {
    cancelledAt: new Date(),
    cancelledBy,
    cancellationReason: reason,
    refundEligible: this.paymentStatus === 'completed' && this.canBeCancelled
  };
  return this.save();
};

bookingSchema.methods.rescheduleBooking = function(newDate, newSlot, newPaymentMethod, reason, rescheduledBy = 'customer') {
  if (!this.canBeRescheduled) {
    throw new Error('This booking cannot be rescheduled');
  }
  
  // Store original booking details (only on first reschedule)
  if (!this.reschedulingDetails.originalDate) {
    this.reschedulingDetails.originalDate = this.bookingDetails.date;
    this.reschedulingDetails.originalSlot = this.bookingDetails.slot;
  }
  
  // Update booking details with new date and slot
  this.bookingDetails.date = newDate;
  this.bookingDetails.slot = newSlot;
  
  // Update payment method if provided and different
  if (newPaymentMethod && this.paymentDetails.paymentMethod !== newPaymentMethod) {
    this.paymentDetails.paymentMethod = newPaymentMethod;
  }
  
  // Update rescheduling details
  this.reschedulingDetails.rescheduledAt = new Date();
  this.reschedulingDetails.rescheduledBy = rescheduledBy;
  this.reschedulingDetails.rescheduleReason = reason || '';
  this.reschedulingDetails.rescheduleCount = (this.reschedulingDetails.rescheduleCount || 0) + 1;
  
  return this.save();
};

bookingSchema.methods.completePayment = function(paymentDetails) {
  this.paymentStatus = 'completed';
  this.paymentDetails = {
    ...this.paymentDetails,
    ...paymentDetails,
    paidAt: new Date()
  };
  
  if (this.status === 'pending') {
    this.status = 'confirmed';
  }
  
  return this.save();
};

// Static methods
bookingSchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.dateFrom || options.dateTo) {
    query['bookingDetails.date'] = {};
    if (options.dateFrom) query['bookingDetails.date'].$gte = new Date(options.dateFrom);
    if (options.dateTo) query['bookingDetails.date'].$lte = new Date(options.dateTo);
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('userId', 'name email phone')
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

bookingSchema.statics.findUpcomingBookings = function(userId) {
  const now = new Date();
  return this.find({
    userId,
    'bookingDetails.date': { $gte: now },
    status: { $in: ['confirmed', 'pending'] }
  })
  .sort({ 'bookingDetails.date': 1 })
  .populate('userId', 'name email phone');
};

bookingSchema.statics.findPastBookings = function(userId) {
  const now = new Date();
  return this.find({
    userId,
    'bookingDetails.date': { $lt: now }
  })
  .sort({ 'bookingDetails.date': -1 })
  .populate('userId', 'name email phone');
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;