import mongoose from 'mongoose';

// Embedded schema for individual time slots
const timeSlotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    trim: true,
    validate: {
      validator: function(time) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
      },
      message: 'Start time must be in HH:MM format'
    }
  },
  
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    trim: true,
    validate: {
      validator: function(time) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
      },
      message: 'End time must be in HH:MM format'
    }
  },
  
  maxBookings: {
    type: Number,
    required: [true, 'Maximum bookings is required'],
    min: [1, 'Maximum bookings must be at least 1'],
    default: 10
  },
  
  currentBookings: {
    type: Number,
    default: 0,
    min: [0, 'Current bookings cannot be negative']
  },
  
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  }
}, {
  _id: true // Keep individual slot IDs for booking references
});

// Main schema for daily slots
const dailySlotsSchema = new mongoose.Schema({
  // Date for this day's slots
  date: {
    type: Date,
    required: [true, 'Date is required'],
    unique: true, // Only one document per date
    index: true
  },
  
  // Array of time slots for this date
  slots: [timeSlotSchema],
  
  // Admin management
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
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
dailySlotsSchema.index({ date: 1 });
dailySlotsSchema.index({ createdBy: 1 });
dailySlotsSchema.index({ 'slots.startTime': 1 });

// Pre-save middleware
dailySlotsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Validate that each slot's end time is after start time
  for (const slot of this.slots) {
    const startMinutes = slot.startTime.split(':').reduce((acc, time) => (60 * acc) + +time);
    const endMinutes = slot.endTime.split(':').reduce((acc, time) => (60 * acc) + +time);
    
    if (endMinutes <= startMinutes) {
      return next(new Error(`Slot ${slot.startTime}-${slot.endTime}: End time must be after start time`));
    }
    
    // Ensure current bookings doesn't exceed max bookings
    if (slot.currentBookings > slot.maxBookings) {
      return next(new Error(`Slot ${slot.startTime}-${slot.endTime}: Current bookings cannot exceed maximum bookings`));
    }
  }
  
  next();
});

// Instance methods
dailySlotsSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

dailySlotsSchema.methods.getAvailableSlots = function() {
  return this.slots.filter(slot => 
    slot.isAvailable && slot.currentBookings < slot.maxBookings
  );
};

dailySlotsSchema.methods.getSlotById = function(slotId) {
  return this.slots.id(slotId);
};

dailySlotsSchema.methods.bookSlot = function(slotId) {
  const slot = this.getSlotById(slotId);
  if (!slot) {
    throw new Error('Slot not found');
  }
  
  if (!slot.isAvailable) {
    throw new Error('Slot is not available');
  }
  
  if (slot.currentBookings >= slot.maxBookings) {
    throw new Error('Slot is fully booked');
  }
  
  slot.currentBookings += 1;
  return this.save();
};

dailySlotsSchema.methods.cancelSlotBooking = function(slotId) {
  const slot = this.getSlotById(slotId);
  if (!slot) {
    throw new Error('Slot not found');
  }
  
  if (slot.currentBookings <= 0) {
    throw new Error('No bookings to cancel');
  }
  
  slot.currentBookings -= 1;
  return this.save();
};

dailySlotsSchema.methods.addSlot = function(slotData) {
  // Check for overlapping slots
  const newStartMinutes = slotData.startTime.split(':').reduce((acc, time) => (60 * acc) + +time);
  const newEndMinutes = slotData.endTime.split(':').reduce((acc, time) => (60 * acc) + +time);
  
  for (const existingSlot of this.slots) {
    const existingStartMinutes = existingSlot.startTime.split(':').reduce((acc, time) => (60 * acc) + +time);
    const existingEndMinutes = existingSlot.endTime.split(':').reduce((acc, time) => (60 * acc) + +time);
    
    // Check for overlap
    if ((newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes)) {
      throw new Error(`New slot overlaps with existing slot ${existingSlot.startTime}-${existingSlot.endTime}`);
    }
  }
  
  this.slots.push(slotData);
  return this.save();
};

dailySlotsSchema.methods.removeSlot = function(slotId) {
  const slot = this.getSlotById(slotId);
  if (!slot) {
    throw new Error('Slot not found');
  }
  
  if (slot.currentBookings > 0) {
    throw new Error('Cannot remove slot with existing bookings');
  }
  
  slot.remove();
  return this.save();
};

// Static methods
dailySlotsSchema.statics.findByDate = function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.findOne({
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    isActive: true
  });
};

dailySlotsSchema.statics.createSlotsForDate = async function(date, slots, createdBy) {
  // Check if slots already exist for this date
  const existing = await this.findByDate(date);
  if (existing) {
    throw new Error('Slots already exist for this date');
  }
  
  const dailySlots = new this({
    date: new Date(date),
    slots: slots.map(slot => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxBookings: slot.maxBookings || 10,
      isAvailable: slot.isAvailable !== undefined ? slot.isAvailable : true
    })),
    createdBy
  });
  
  return dailySlots.save();
};

dailySlotsSchema.statics.findAvailableSlotsForDate = function(date) {
  return this.findByDate(date).then(dailySlots => {
    if (!dailySlots) {
      return [];
    }
    
    return dailySlots.getAvailableSlots();
  });
};

// Virtual for total slots count
dailySlotsSchema.virtual('totalSlots').get(function() {
  return this.slots.length;
});

// Virtual for available slots count
dailySlotsSchema.virtual('availableSlotsCount').get(function() {
  return this.slots.reduce((count, slot) => {
    return count + (slot.isAvailable && slot.currentBookings < slot.maxBookings ? 1 : 0);
  }, 0);
});

// Ensure virtual fields are serialized
dailySlotsSchema.set('toJSON', { virtuals: true });
dailySlotsSchema.set('toObject', { virtuals: true });

const DailySlots = mongoose.model('DailySlots', dailySlotsSchema);

export default DailySlots;




