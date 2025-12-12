import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  // User reference (1 to many relationship)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  
  // Address details
  houseFlatNumber: {
    type: String,
    required: [true, 'House/Flat number is required'],
    trim: true,
    maxlength: [50, 'House/Flat number cannot exceed 50 characters']
  },
  
  streetAreaName: {
    type: String,
    required: [true, 'Street/Area name is required'],
    trim: true,
    maxlength: [100, 'Street/Area name cannot exceed 100 characters']
  },
  
  completeAddress: {
    type: String,
    required: [true, 'Complete address is required'],
    trim: true,
    maxlength: [200, 'Complete address cannot exceed 200 characters']
  },
  
  landmark: {
    type: String,
    trim: true,
    maxlength: [100, 'Landmark cannot exceed 100 characters']
  },
  
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true,
    match: [/^[1-9][0-9]{5}$/, 'Please provide a valid 6-digit pincode']
  },
  
  city: {
    type: String,
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters']
  },
  
  state: {
    type: String,
    trim: true,
    maxlength: [50, 'State name cannot exceed 50 characters'],
    default: 'Bihar' // Default state as seen in the UI
  },
  
  country: {
    type: String,
    trim: true,
    default: 'India',
    maxlength: [50, 'Country name cannot exceed 50 characters']
  },
  
  // Phone number (required for each address)
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number']
  },
  
  // Default address flag (only one per user)
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // Address type (for future extensibility)
  addressType: {
    type: String,
    enum: {
      values: ['home', 'office', 'other'],
      message: 'Address type must be one of: home, office, other'
    },
    default: 'home'
  },
  
  // Address status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Additional metadata
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

// Indexes for better query performance
addressSchema.index({ user: 1, isDefault: 1 });
addressSchema.index({ user: 1, isActive: 1 });
addressSchema.index({ pincode: 1 });

// Pre-save middleware to handle default address logic
addressSchema.pre('save', async function(next) {
  // Only proceed if isDefault is being set to true
  if (this.isDefault && this.isModified('isDefault')) {
    try {
      // Find all addresses for this user
      const userAddresses = await mongoose.model('Address').find({
        user: this.user,
        _id: { $ne: this._id }, // Exclude current address
        isActive: true
      });
      
      // Set all other addresses to non-default
      if (userAddresses.length > 0) {
        await mongoose.model('Address').updateMany(
          {
            user: this.user,
            _id: { $ne: this._id },
            isActive: true
          },
          { 
            isDefault: false,
            updatedAt: new Date()
          }
        );
      }
    } catch (error) {
      return next(error);
    }
  }
  
  // Update the updatedAt field
  this.updatedAt = new Date();
  next();
});

// Pre-update middleware for updateOne, updateMany, findOneAndUpdate
addressSchema.pre(['updateOne', 'findOneAndUpdate'], async function(next) {
  const update = this.getUpdate();
  
  // Only proceed if isDefault is being set to true
  if (update.isDefault === true) {
    try {
      const docToUpdate = await this.model.findOne(this.getQuery());
      if (!docToUpdate) {
        return next(new Error('Address not found'));
      }
      
      // Find all addresses for this user
      const userAddresses = await this.model.find({
        user: docToUpdate.user,
        _id: { $ne: docToUpdate._id },
        isActive: true
      });
      
      // Set all other addresses to non-default
      if (userAddresses.length > 0) {
        await this.model.updateMany(
          {
            user: docToUpdate.user,
            _id: { $ne: docToUpdate._id },
            isActive: true
          },
          { 
            isDefault: false,
            updatedAt: new Date()
          }
        );
      }
    } catch (error) {
      return next(error);
    }
  }
  
  // Update the updatedAt field
  if (update && !update.$set) {
    update.$set = {};
  }
  if (update && !update.$set.updatedAt) {
    update.$set.updatedAt = new Date();
  }
  
  next();
});

// Instance methods
addressSchema.methods.toSafeObject = function() {
  const addressObj = this.toObject();
  delete addressObj.__v;
  return addressObj;
};

// Static methods
addressSchema.statics.findByUser = function(userId, includeInactive = false) {
  const query = { user: userId };
  if (!includeInactive) {
    query.isActive = true;
  }
  return this.find(query).sort({ isDefault: -1, createdAt: -1 });
};

addressSchema.statics.findDefaultByUser = function(userId) {
  return this.findOne({ 
    user: userId, 
    isDefault: true, 
    isActive: true 
  });
};

addressSchema.statics.setDefaultAddress = async function(userId, addressId) {
  try {
    console.log(`🔍 setDefaultAddress - User ID: ${userId}, Address ID: ${addressId}`);
    
    // First, check if the address exists and belongs to the user
    const addressExists = await this.findOne({
      _id: addressId,
      user: userId,
      isActive: true
    });
    
    console.log(`🔍 Address exists check:`, {
      addressId,
      userId,
      found: !!addressExists,
      isActive: addressExists?.isActive,
      userMatch: addressExists?.user?.toString() === userId
    });
    
    if (!addressExists) {
      console.log(`❌ Address not found or doesn't belong to user`);
      throw new Error('Address not found or does not belong to user');
    }
    
    // Set all user addresses to non-default
    const unsetResult = await this.updateMany(
      { user: userId, isActive: true },
      { isDefault: false, updatedAt: new Date() }
    );
    
    console.log(`🔍 Unset other defaults:`, { modifiedCount: unsetResult.modifiedCount });
    
    // Set the specified address as default
    const result = await this.updateOne(
      { _id: addressId, user: userId, isActive: true },
      { isDefault: true, updatedAt: new Date() }
    );
    
    console.log(`🔍 Set as default result:`, {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
    
    if (result.matchedCount === 0) {
      throw new Error('Address not found or does not belong to user');
    }
  } catch (error) {
    console.error('Error in setDefaultAddress:', error);
    throw error;
  }
};

// Virtual for full address string
addressSchema.virtual('fullAddress').get(function() {
  const parts = [
    this.houseFlatNumber,
    this.streetAreaName,
    this.completeAddress,
    this.landmark,
    this.city,
    this.state,
    this.pincode,
    this.country,
    this.phone ? `Phone: ${this.phone}` : null
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Ensure virtual fields are included in JSON output
addressSchema.set('toJSON', { virtuals: true });

const Address = mongoose.model('Address', addressSchema);

export default Address;
