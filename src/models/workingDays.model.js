import mongoose from 'mongoose';

const workingDaysSchema = new mongoose.Schema({
  // Day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  dayOfWeek: {
    type: Number,
    required: [true, 'Day of week is required'],
    min: 0,
    max: 6,
    unique: true
  },
  
  // Working status
  isWorking: {
    type: Boolean,
    default: true
  },
  
  // Working hours
  startTime: {
    type: String,
    required: function() {
      return this.isWorking;
    },
    trim: true,
    validate: {
      validator: function(time) {
        if (!this.isWorking) return true;
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
      },
      message: 'Start time must be in HH:MM format'
    }
  },
  
  endTime: {
    type: String,
    required: function() {
      return this.isWorking;
    },
    trim: true,
    validate: {
      validator: function(time) {
        if (!this.isWorking) return true;
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
      },
      message: 'End time must be in HH:MM format'
    }
  },
  
  // Break time (optional)
  breakStart: {
    type: String,
    trim: true,
    validate: {
      validator: function(time) {
        if (!time) return true;
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
      },
      message: 'Break start time must be in HH:MM format'
    }
  },
  
  breakEnd: {
    type: String,
    trim: true,
    validate: {
      validator: function(time) {
        if (!time) return true;
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
      },
      message: 'Break end time must be in HH:MM format'
    }
  },
  
  // Admin management
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  isActive: {
    type: Boolean,
    default: true
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

// Indexes
workingDaysSchema.index({ dayOfWeek: 1 });
workingDaysSchema.index({ isActive: 1 });

// Pre-save middleware to validate working hours
workingDaysSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  if (this.isWorking) {
    // Validate that end time is after start time
    const startMinutes = this.startTime.split(':').reduce((acc, time) => (60 * acc) + +time);
    const endMinutes = this.endTime.split(':').reduce((acc, time) => (60 * acc) + +time);
    
    if (endMinutes <= startMinutes) {
      return next(new Error('End time must be after start time'));
    }
    
    // Validate break time if provided
    if (this.breakStart && this.breakEnd) {
      const breakStartMinutes = this.breakStart.split(':').reduce((acc, time) => (60 * acc) + +time);
      const breakEndMinutes = this.breakEnd.split(':').reduce((acc, time) => (60 * acc) + +time);
      
      if (breakEndMinutes <= breakStartMinutes) {
        return next(new Error('Break end time must be after break start time'));
      }
      
      // Ensure break time is within working hours
      if (breakStartMinutes < startMinutes || breakEndMinutes > endMinutes) {
        return next(new Error('Break time must be within working hours'));
      }
    }
  }
  
  next();
});

// Instance methods
workingDaysSchema.methods.toSafeObject = function() {
  const dayObj = this.toObject();
  delete dayObj.__v;
  return dayObj;
};

workingDaysSchema.methods.isWorkingAtTime = function(time) {
  if (!this.isWorking) return false;
  
  const timeMinutes = time.split(':').reduce((acc, t) => (60 * acc) + +t);
  const startMinutes = this.startTime.split(':').reduce((acc, t) => (60 * acc) + +t);
  const endMinutes = this.endTime.split(':').reduce((acc, t) => (60 * acc) + +t);
  
  // Check if time is within working hours
  if (timeMinutes < startMinutes || timeMinutes >= endMinutes) {
    return false;
  }
  
  // Check if time is during break
  if (this.breakStart && this.breakEnd) {
    const breakStartMinutes = this.breakStart.split(':').reduce((acc, t) => (60 * acc) + +t);
    const breakEndMinutes = this.breakEnd.split(':').reduce((acc, t) => (60 * acc) + +t);
    
    if (timeMinutes >= breakStartMinutes && timeMinutes < breakEndMinutes) {
      return false;
    }
  }
  
  return true;
};

workingDaysSchema.methods.getAvailableTimeSlots = function(slotDuration = 45) {
  if (!this.isWorking) return [];
  
  const startMinutes = this.startTime.split(':').reduce((acc, t) => (60 * acc) + +t);
  const endMinutes = this.endTime.split(':').reduce((acc, t) => (60 * acc) + +t);
  
  const slots = [];
  let currentMinutes = startMinutes;
  
  while (currentMinutes + slotDuration <= endMinutes) {
    // Skip break time
    if (this.breakStart && this.breakEnd) {
      const breakStartMinutes = this.breakStart.split(':').reduce((acc, t) => (60 * acc) + +t);
      const breakEndMinutes = this.breakEnd.split(':').reduce((acc, t) => (60 * acc) + +t);
      
      if (currentMinutes >= breakStartMinutes && currentMinutes < breakEndMinutes) {
        currentMinutes = breakEndMinutes;
        continue;
      }
      
      if (currentMinutes + slotDuration > breakStartMinutes && currentMinutes < breakEndMinutes) {
        currentMinutes = breakEndMinutes;
        continue;
      }
    }
    
    const startTime = Math.floor(currentMinutes / 60).toString().padStart(2, '0') + 
                     ':' + (currentMinutes % 60).toString().padStart(2, '0');
    const endTime = Math.floor((currentMinutes + slotDuration) / 60).toString().padStart(2, '0') + 
                   ':' + ((currentMinutes + slotDuration) % 60).toString().padStart(2, '0');
    
    slots.push({
      startTime,
      endTime,
      duration: slotDuration
    });
    
    currentMinutes += slotDuration;
  }
  
  return slots;
};

// Static methods
workingDaysSchema.statics.getWorkingDay = function(dayOfWeek) {
  return this.findOne({ dayOfWeek, isActive: true });
};

workingDaysSchema.statics.getAllWorkingDays = function() {
  return this.find({ isActive: true }).sort({ dayOfWeek: 1 });
};

workingDaysSchema.statics.isDateWorking = async function(date) {
  const dayOfWeek = date.getDay();
  const workingDay = await this.findOne({ dayOfWeek, isActive: true });
  
  return workingDay ? workingDay.isWorking : false;
};

workingDaysSchema.statics.getAvailableSlotsForDate = async function(date, slotDuration = 45) {
  const dayOfWeek = date.getDay();
  const workingDay = await this.findOne({ dayOfWeek, isActive: true });
  
  if (!workingDay || !workingDay.isWorking) {
    return [];
  }
  
  return workingDay.getAvailableTimeSlots(slotDuration);
};

// Virtual for day name
workingDaysSchema.virtual('dayName').get(function() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[this.dayOfWeek];
});

// Virtual for working hours duration
workingDaysSchema.virtual('workingHours').get(function() {
  if (!this.isWorking) return 0;
  
  const startMinutes = this.startTime.split(':').reduce((acc, t) => (60 * acc) + +t);
  const endMinutes = this.endTime.split(':').reduce((acc, t) => (60 * acc) + +t);
  
  return endMinutes - startMinutes;
});

// Ensure virtual fields are serialized
workingDaysSchema.set('toJSON', { virtuals: true });
workingDaysSchema.set('toObject', { virtuals: true });

const WorkingDays = mongoose.model('WorkingDays', workingDaysSchema);

export default WorkingDays;



