import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  // Basic Service Information
  name: {
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
  
  // Pricing Information
  price: {
    type: Number,
    required: [true, 'Service price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  taxIncluded: {
    type: Boolean,
    default: true
  },
  
  // Service Details
  duration: {
    type: String,
    default: null,
    trim: true
  },
  
  category: {
    type: String,
    required: [true, 'Service category is required'],
    trim: true,
    enum: {
      values: ['Regular', 'Premium', 'Bridal', 'Classic'],
      message: 'Category must be one of: Regular, Premium, Bridal, Classic'
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
  
  // Media
  image: [{
    type: String,
    required: [true, 'Service image is required'],
    trim: true
  }],
  
  // Service Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  // Admin Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true
  }],
  
  popularity: {
    type: Number,
    default: 0,
    min: 0
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
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ createdAt: -1 });
serviceSchema.index({ popularity: -1 });

// Pre-save middleware to update updatedAt
serviceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance methods
serviceSchema.methods.incrementPopularity = function() {
  this.popularity += 1;
  return this.save();
};

serviceSchema.methods.toggleAvailability = function() {
  this.isAvailable = !this.isAvailable;
  return this.save();
};

// Static methods
serviceSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true, isAvailable: true });
};

serviceSchema.statics.findPopularServices = function(limit = 10) {
  return this.find({ isActive: true, isAvailable: true })
    .sort({ popularity: -1 })
    .limit(limit);
};

// Virtual for formatted price
serviceSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price.toLocaleString('en-IN')}`;
});

// Ensure virtual fields are serialized
serviceSchema.set('toJSON', { virtuals: true });
serviceSchema.set('toObject', { virtuals: true });

const Service = mongoose.model('Service', serviceSchema);

export default Service;
