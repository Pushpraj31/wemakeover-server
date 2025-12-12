import mongoose from 'mongoose';
import crypto from 'crypto';

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed'],
    default: 'active',
    required: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  },
  unsubscribeToken: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  preferences: {
    beautyTips: {
      type: Boolean,
      default: true
    },
    newServices: {
      type: Boolean,
      default: true
    },
    offers: {
      type: Boolean,
      default: true
    },
    all: {
      type: Boolean,
      default: true
    }
  },
  source: {
    type: String,
    enum: ['about-page', 'home-page', 'footer', 'checkout', 'other'],
    default: 'other'
  },
  metadata: {
    userAgent: {
      type: String,
      trim: true
    },
    ipAddress: {
      type: String,
      trim: true
    },
    referrer: {
      type: String,
      trim: true
    }
  },
  emailsSent: {
    type: Number,
    default: 0
  },
  lastEmailSentAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ status: 1 });
newsletterSchema.index({ subscribedAt: -1 });
newsletterSchema.index({ unsubscribeToken: 1 });

// Virtual for subscription duration
newsletterSchema.virtual('subscriptionDuration').get(function() {
  if (!this.subscribedAt) return 0;
  const endDate = this.unsubscribedAt || new Date();
  return Math.floor((endDate - this.subscribedAt) / (1000 * 60 * 60 * 24)); // Days
});

// Pre-save middleware to generate unsubscribe token
newsletterSchema.pre('save', function(next) {
  if (this.isNew && !this.unsubscribeToken) {
    this.unsubscribeToken = crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Instance method to unsubscribe
newsletterSchema.methods.unsubscribe = function() {
  this.status = 'unsubscribed';
  this.unsubscribedAt = new Date();
  return this.save();
};

// Instance method to resubscribe
newsletterSchema.methods.resubscribe = function() {
  this.status = 'active';
  this.unsubscribedAt = null;
  this.subscribedAt = new Date();
  return this.save();
};

// Static method to get active subscribers
newsletterSchema.statics.getActiveSubscribers = function(filters = {}) {
  return this.find({ status: 'active', ...filters });
};

// Static method to get subscriber stats
newsletterSchema.statics.getStats = async function() {
  const [totalSubscribers, activeSubscribers, unsubscribed, recentSubs] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ status: 'active' }),
    this.countDocuments({ status: 'unsubscribed' }),
    this.countDocuments({
      subscribedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    })
  ]);

  return {
    total: totalSubscribers,
    active: activeSubscribers,
    unsubscribed,
    recentSubscriptions: recentSubs,
    retentionRate: totalSubscribers > 0 ? ((activeSubscribers / totalSubscribers) * 100).toFixed(2) : 0
  };
};

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

export default Newsletter;


