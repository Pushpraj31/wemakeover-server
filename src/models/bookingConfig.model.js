import mongoose from 'mongoose';

/**
 * BookingConfig Schema
 * 
 * Stores system-wide booking configuration that can be managed by admins.
 * This allows dynamic business rule changes without code deployment.
 * 
 * Examples:
 * - MINIMUM_ORDER_VALUE: Minimum order amount required for booking
 * - MAX_RESCHEDULE_COUNT: Maximum number of reschedules allowed
 * - CANCELLATION_WINDOW_HOURS: Hours before booking when cancellation is allowed
 */
const bookingConfigSchema = new mongoose.Schema({
  configKey: {
    type: String,
    required: [true, 'Config key is required'],
    unique: true,
    uppercase: true,
    trim: true,
    enum: [
      'MINIMUM_ORDER_VALUE',
      'MAX_RESCHEDULE_COUNT',
      'CANCELLATION_WINDOW_HOURS',
      'RESCHEDULE_WINDOW_HOURS',
      'MAX_SERVICES_PER_BOOKING',
      'PLATFORM_FEE',
      'TRANSPORTATION_FEE'
    ]
  },
  value: {
    type: Number,
    required: [true, 'Config value is required'],
    min: [0, 'Config value cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true,
    enum: ['INR', 'USD', 'EUR']
  },
  description: {
    type: String,
    required: [true, 'Config description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Last updated by is required']
  },
  metadata: {
    unit: {
      type: String,
      enum: ['rupees', 'hours', 'count', 'percentage', 'minutes'],
      default: 'rupees'
    },
    displayName: {
      type: String,
      trim: true
    },
    helpText: {
      type: String,
      trim: true,
      maxlength: [1000, 'Help text cannot exceed 1000 characters']
    },
    validationRules: {
      min: Number,
      max: Number,
      step: Number
    }
  },
  auditLog: [{
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    previousValue: Number,
    newValue: Number,
    updatedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
bookingConfigSchema.index({ configKey: 1 });
bookingConfigSchema.index({ isActive: 1 });
bookingConfigSchema.index({ lastUpdatedBy: 1 });

// Virtual for formatted value (with currency/unit)
bookingConfigSchema.virtual('formattedValue').get(function() {
  const unit = this.metadata?.unit || 'rupees';
  
  switch(unit) {
    case 'rupees':
      return `₹${this.value}`;
    case 'hours':
      return `${this.value} hours`;
    case 'count':
      return `${this.value}`;
    case 'percentage':
      return `${this.value}%`;
    case 'minutes':
      return `${this.value} minutes`;
    default:
      return `${this.value}`;
  }
});

// Pre-save middleware to add audit log entry
bookingConfigSchema.pre('save', function(next) {
  if (this.isModified('value') && !this.isNew) {
    // Add audit log entry
    this.auditLog.push({
      updatedBy: this.lastUpdatedBy,
      previousValue: this._previousValue || this.value,
      newValue: this.value,
      updatedAt: new Date(),
      reason: this._updateReason || 'Updated via admin panel'
    });
  }
  next();
});

// Instance method to update config value
bookingConfigSchema.methods.updateValue = function(newValue, adminId, reason = null) {
  this._previousValue = this.value;
  this._updateReason = reason;
  this.value = newValue;
  this.lastUpdatedBy = adminId;
  return this.save();
};

// Instance method to toggle active status
bookingConfigSchema.methods.toggleActive = function(adminId) {
  this.isActive = !this.isActive;
  this.lastUpdatedBy = adminId;
  return this.save();
};

// Static method to get config by key
bookingConfigSchema.statics.getByKey = function(configKey) {
  return this.findOne({ 
    configKey: configKey.toUpperCase(),
    isActive: true 
  });
};

// Static method to get all active configs
bookingConfigSchema.statics.getAllActive = function() {
  return this.find({ isActive: true })
    .populate('lastUpdatedBy', 'name email')
    .sort({ configKey: 1 });
};

// Static method to seed initial configs
bookingConfigSchema.statics.seedInitialConfigs = async function(adminId) {
  const initialConfigs = [
    {
      configKey: 'MINIMUM_ORDER_VALUE',
      value: 999,
      currency: 'INR',
      description: 'Minimum order value required to place a booking',
      isActive: true,
      lastUpdatedBy: adminId,
      metadata: {
        unit: 'rupees',
        displayName: 'Minimum Order Value',
        helpText: 'Users must add services worth at least this amount to place a booking. This ensures service quality and operational efficiency.',
        validationRules: {
          min: 0,
          max: 10000,
          step: 1
        }
      }
    },
    {
      configKey: 'MAX_RESCHEDULE_COUNT',
      value: 3,
      currency: 'INR',
      description: 'Maximum number of times a booking can be rescheduled',
      isActive: true,
      lastUpdatedBy: adminId,
      metadata: {
        unit: 'count',
        displayName: 'Max Reschedule Count',
        helpText: 'Limits the number of times a customer can reschedule their booking to prevent abuse.',
        validationRules: {
          min: 0,
          max: 10,
          step: 1
        }
      }
    },
    {
      configKey: 'CANCELLATION_WINDOW_HOURS',
      value: 2,
      currency: 'INR',
      description: 'Minimum hours before booking time when cancellation is allowed',
      isActive: true,
      lastUpdatedBy: adminId,
      metadata: {
        unit: 'hours',
        displayName: 'Cancellation Window',
        helpText: 'Customers can cancel their booking only if it is more than this many hours away.',
        validationRules: {
          min: 0,
          max: 72,
          step: 1
        }
      }
    },
    {
      configKey: 'RESCHEDULE_WINDOW_HOURS',
      value: 4,
      currency: 'INR',
      description: 'Minimum hours before booking time when rescheduling is allowed',
      isActive: true,
      lastUpdatedBy: adminId,
      metadata: {
        unit: 'hours',
        displayName: 'Reschedule Window',
        helpText: 'Customers can reschedule their booking only if it is more than this many hours away.',
        validationRules: {
          min: 0,
          max: 72,
          step: 1
        }
      }
    }
  ];

  const results = [];
  for (const config of initialConfigs) {
    try {
      // Check if config already exists
      const existing = await this.findOne({ configKey: config.configKey });
      if (!existing) {
        const newConfig = await this.create(config);
        results.push({ success: true, config: newConfig });
      } else {
        results.push({ success: false, message: `Config ${config.configKey} already exists`, config: existing });
      }
    } catch (error) {
      results.push({ success: false, message: error.message, configKey: config.configKey });
    }
  }

  return results;
};

const BookingConfig = mongoose.model('BookingConfig', bookingConfigSchema);

export default BookingConfig;

