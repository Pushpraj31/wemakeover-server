import mongoose from 'mongoose';

/**
 * ServiceableCity Model
 * 
 * Manages cities where services are available
 * Admin-configurable for scalability
 */
const serviceableCitySchema = new mongoose.Schema({
  // Basic Information
  city: {
    type: String,
    required: [true, 'City name is required'],
    trim: true,
    index: true
  },
  state: {
    type: String,
    required: [true, 'State name is required'],
    trim: true,
    default: 'Bihar'
  },
  country: {
    type: String,
    trim: true,
    default: 'India'
  },
  
  // Status Management
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Display & Ordering
  displayName: {
    type: String, // For custom display (e.g., "Gaya (Bihar)")
    trim: true
  },
  priority: {
    type: Number,
    default: 0, // Higher priority = shown first
    index: true
  },
  
  // Service Coverage Details
  serviceRadius: {
    type: Number, // In kilometers (optional, for future pincode validation)
    default: null
  },
  coveragePincodes: [{
    type: String,
    trim: true
  }], // Optional: specific pincodes covered
  
  // Metadata
  launchDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  },
  notes: {
    type: String, // Internal notes for admin
    trim: true
  },
  
  // Analytics
  bookingCount: {
    type: Number,
    default: 0
  },
  lastBookingAt: {
    type: Date,
    default: null
  },
  
  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
serviceableCitySchema.index({ city: 1, state: 1 }, { unique: true });
serviceableCitySchema.index({ isActive: 1, priority: -1 });

// Virtual for full location name
serviceableCitySchema.virtual('fullLocation').get(function() {
  return this.displayName || `${this.city}, ${this.state}`;
});

// Pre-save middleware to normalize city/state names
serviceableCitySchema.pre('save', function(next) {
  // Capitalize first letter of each word
  if (this.isModified('city')) {
    this.city = this.city
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  if (this.isModified('state')) {
    this.state = this.state
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Auto-generate displayName if not provided
  if (!this.displayName) {
    this.displayName = `${this.city}, ${this.state}`;
  }
  
  next();
});

// Static method: Get all active cities
serviceableCitySchema.statics.getActiveCities = async function() {
  return this.find({ isActive: true })
    .sort({ priority: -1, city: 1 })
    .select('city state displayName priority coveragePincodes')
    .lean();
};

// Static method: Check if city is serviceable
serviceableCitySchema.statics.isServiceable = async function(cityName) {
  if (!cityName) return false;
  
  const normalizedCity = cityName.trim().toLowerCase();
  
  const city = await this.findOne({
    city: new RegExp(`^${normalizedCity}$`, 'i'),
    isActive: true
  }).lean();
  
  return !!city;
};

// Static method: Get city details
serviceableCitySchema.statics.getCityDetails = async function(cityName) {
  if (!cityName) return null;
  
  const normalizedCity = cityName.trim();
  
  return this.findOne({
    city: new RegExp(`^${normalizedCity}$`, 'i'),
    isActive: true
  }).lean();
};

// Static method: Increment booking count
serviceableCitySchema.statics.incrementBookingCount = async function(cityName) {
  if (!cityName) return;
  
  const normalizedCity = cityName.trim();
  
  await this.findOneAndUpdate(
    { city: new RegExp(`^${normalizedCity}$`, 'i') },
    {
      $inc: { bookingCount: 1 },
      $set: { lastBookingAt: new Date() }
    }
  );
};

// Instance method: Toggle active status
serviceableCitySchema.methods.toggleActive = async function() {
  this.isActive = !this.isActive;
  return this.save();
};

const ServiceableCity = mongoose.model('ServiceableCity', serviceableCitySchema);

export default ServiceableCity;




