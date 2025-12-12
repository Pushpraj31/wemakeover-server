import DailySlots from '../models/dailySlots.model.js';

// Validation middleware for slot creation
export const validateSlotCreation = (req, res, next) => {
  const errors = [];
  
  // Validate date
  if (!req.body.date) {
    errors.push('Date is required');
  } else {
    const date = new Date(req.body.date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    } else if (date < new Date()) {
      errors.push('Date cannot be in the past');
    }
  }
  
  // Validate slots array
  if (!req.body.slots || !Array.isArray(req.body.slots)) {
    errors.push('Slots must be an array');
  } else if (req.body.slots.length === 0) {
    errors.push('At least one slot is required');
  } else {
    // Validate each slot
    req.body.slots.forEach((slot, index) => {
      if (!slot.startTime) {
        errors.push(`Slot ${index + 1}: startTime is required`);
      } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.startTime)) {
        errors.push(`Slot ${index + 1}: startTime must be in HH:MM format`);
      }
      
      if (!slot.endTime) {
        errors.push(`Slot ${index + 1}: endTime is required`);
      } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.endTime)) {
        errors.push(`Slot ${index + 1}: endTime must be in HH:MM format`);
      }
      
      // Validate time sequence
      if (slot.startTime && slot.endTime) {
        const startMinutes = slot.startTime.split(':').reduce((acc, time) => (60 * acc) + +time);
        const endMinutes = slot.endTime.split(':').reduce((acc, time) => (60 * acc) + +time);
        
        if (endMinutes <= startMinutes) {
          errors.push(`Slot ${index + 1}: endTime must be after startTime`);
        }
      }
      
      // Validate maxBookings
      if (slot.maxBookings !== undefined) {
        if (typeof slot.maxBookings !== 'number' || slot.maxBookings < 1 || slot.maxBookings > 100) {
          errors.push(`Slot ${index + 1}: maxBookings must be a number between 1 and 100`);
        }
      }
      
      // Validate isAvailable
      if (slot.isAvailable !== undefined && typeof slot.isAvailable !== 'boolean') {
        errors.push(`Slot ${index + 1}: isAvailable must be a boolean value`);
      }
    });
    
    // Check for overlapping slots
    const slots = req.body.slots;
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const slot1 = slots[i];
        const slot2 = slots[j];
        
        if (slot1.startTime && slot1.endTime && slot2.startTime && slot2.endTime) {
          const start1 = slot1.startTime.split(':').reduce((acc, time) => (60 * acc) + +time);
          const end1 = slot1.endTime.split(':').reduce((acc, time) => (60 * acc) + +time);
          const start2 = slot2.startTime.split(':').reduce((acc, time) => (60 * acc) + +time);
          const end2 = slot2.endTime.split(':').reduce((acc, time) => (60 * acc) + +time);
          
          if ((start1 < end2 && end1 > start2)) {
            errors.push(`Slot ${i + 1} and Slot ${j + 1} overlap in time`);
          }
        }
      }
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

// Validation middleware for slot update
export const validateSlotUpdate = (req, res, next) => {
  const errors = [];
  
  // Validate slots array
  if (!req.body.slots || !Array.isArray(req.body.slots)) {
    errors.push('Slots must be an array');
  } else {
    // Validate each slot (same as creation)
    req.body.slots.forEach((slot, index) => {
      if (!slot.startTime) {
        errors.push(`Slot ${index + 1}: startTime is required`);
      } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.startTime)) {
        errors.push(`Slot ${index + 1}: startTime must be in HH:MM format`);
      }
      
      if (!slot.endTime) {
        errors.push(`Slot ${index + 1}: endTime is required`);
      } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.endTime)) {
        errors.push(`Slot ${index + 1}: endTime must be in HH:MM format`);
      }
      
      // Validate time sequence
      if (slot.startTime && slot.endTime) {
        const startMinutes = slot.startTime.split(':').reduce((acc, time) => (60 * acc) + +time);
        const endMinutes = slot.endTime.split(':').reduce((acc, time) => (60 * acc) + +time);
        
        if (endMinutes <= startMinutes) {
          errors.push(`Slot ${index + 1}: endTime must be after startTime`);
        }
      }
      
      // Validate maxBookings
      if (slot.maxBookings !== undefined) {
        if (typeof slot.maxBookings !== 'number' || slot.maxBookings < 1 || slot.maxBookings > 100) {
          errors.push(`Slot ${index + 1}: maxBookings must be a number between 1 and 100`);
        }
      }
      
      // Validate isAvailable
      if (slot.isAvailable !== undefined && typeof slot.isAvailable !== 'boolean') {
        errors.push(`Slot ${index + 1}: isAvailable must be a boolean value`);
      }
    });
    
    // Check for overlapping slots
    const slots = req.body.slots;
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const slot1 = slots[i];
        const slot2 = slots[j];
        
        if (slot1.startTime && slot1.endTime && slot2.startTime && slot2.endTime) {
          const start1 = slot1.startTime.split(':').reduce((acc, time) => (60 * acc) + +time);
          const end1 = slot1.endTime.split(':').reduce((acc, time) => (60 * acc) + +time);
          const start2 = slot2.startTime.split(':').reduce((acc, time) => (60 * acc) + +time);
          const end2 = slot2.endTime.split(':').reduce((acc, time) => (60 * acc) + +time);
          
          if ((start1 < end2 && end1 > start2)) {
            errors.push(`Slot ${i + 1} and Slot ${j + 1} overlap in time`);
          }
        }
      }
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

// Validation middleware for adding a single slot
export const validateSingleSlot = (req, res, next) => {
  const errors = [];
  const slot = req.body;
  
  if (!slot.startTime) {
    errors.push('startTime is required');
  } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.startTime)) {
    errors.push('startTime must be in HH:MM format');
  }
  
  if (!slot.endTime) {
    errors.push('endTime is required');
  } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.endTime)) {
    errors.push('endTime must be in HH:MM format');
  }
  
  // Validate time sequence
  if (slot.startTime && slot.endTime) {
    const startMinutes = slot.startTime.split(':').reduce((acc, time) => (60 * acc) + +time);
    const endMinutes = slot.endTime.split(':').reduce((acc, time) => (60 * acc) + +time);
    
    if (endMinutes <= startMinutes) {
      errors.push('endTime must be after startTime');
    }
  }
  
  // Validate maxBookings
  if (slot.maxBookings !== undefined) {
    if (typeof slot.maxBookings !== 'number' || slot.maxBookings < 1 || slot.maxBookings > 100) {
      errors.push('maxBookings must be a number between 1 and 100');
    }
  }
  
  // Validate isAvailable
  if (slot.isAvailable !== undefined && typeof slot.isAvailable !== 'boolean') {
    errors.push('isAvailable must be a boolean value');
  }
  
  // Validate notes
  if (slot.notes && typeof slot.notes !== 'string') {
    errors.push('notes must be a string');
  } else if (slot.notes && slot.notes.length > 200) {
    errors.push('notes cannot exceed 200 characters');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

// Sanitize slot data
export const sanitizeSlotData = (req, res, next) => {
  // Sanitize date
  if (req.body.date) {
    req.body.date = new Date(req.body.date);
  }
  
  // Sanitize slots array
  if (req.body.slots && Array.isArray(req.body.slots)) {
    req.body.slots = req.body.slots.map(slot => {
      const sanitizedSlot = { ...slot };
      
      // Trim string fields
      if (sanitizedSlot.startTime) {
        sanitizedSlot.startTime = sanitizedSlot.startTime.trim();
      }
      if (sanitizedSlot.endTime) {
        sanitizedSlot.endTime = sanitizedSlot.endTime.trim();
      }
      if (sanitizedSlot.notes) {
        sanitizedSlot.notes = sanitizedSlot.notes.trim();
      }
      
      // Convert numbers
      if (sanitizedSlot.maxBookings && typeof sanitizedSlot.maxBookings === 'string') {
        sanitizedSlot.maxBookings = parseInt(sanitizedSlot.maxBookings);
      }
      
      // Convert booleans
      if (sanitizedSlot.isAvailable !== undefined) {
        sanitizedSlot.isAvailable = Boolean(sanitizedSlot.isAvailable);
      }
      
      return sanitizedSlot;
    });
  }
  
  // Sanitize single slot data
  if (req.body.startTime) {
    req.body.startTime = req.body.startTime.trim();
  }
  if (req.body.endTime) {
    req.body.endTime = req.body.endTime.trim();
  }
  if (req.body.notes) {
    req.body.notes = req.body.notes.trim();
  }
  if (req.body.maxBookings && typeof req.body.maxBookings === 'string') {
    req.body.maxBookings = parseInt(req.body.maxBookings);
  }
  if (req.body.isAvailable !== undefined) {
    req.body.isAvailable = Boolean(req.body.isAvailable);
  }
  
  next();
};

// Validate date parameter
export const validateDateParam = (req, res, next) => {
  const { date } = req.params;
  
  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Date parameter is required'
    });
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format. Use YYYY-MM-DD format'
    });
  }
  
  req.dateParam = dateObj;
  next();
};

// Validate slot ID parameter
export const validateSlotIdParam = (req, res, next) => {
  const { slotId } = req.params;
  
  if (!slotId) {
    return res.status(400).json({
      success: false,
      message: 'Slot ID parameter is required'
    });
  }
  
  // Basic MongoDB ObjectId validation
  if (!/^[0-9a-fA-F]{24}$/.test(slotId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid slot ID format'
    });
  }
  
  next();
};

// Check if slots exist for date (for updates)
export const checkSlotsExistForDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    
    const dailySlots = await DailySlots.findByDate(date);
    
    if (!dailySlots) {
      return res.status(404).json({
        success: false,
        message: 'No slots found for this date'
      });
    }
    
    req.dailySlots = dailySlots;
    next();
  } catch (error) {
    console.error('Error checking slots existence:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking slots existence',
      error: error.message
    });
  }
};

// Validate date range parameters
export const validateDateRangeParams = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'startDate and endDate query parameters are required'
    });
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format. Use YYYY-MM-DD format'
    });
  }
  
  if (start > end) {
    return res.status(400).json({
      success: false,
      message: 'startDate must be before endDate'
    });
  }
  
  // Check if date range is not too large (max 90 days)
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 90) {
    return res.status(400).json({
      success: false,
      message: 'Date range cannot exceed 90 days'
    });
  }
  
  req.dateRange = { start, end, diffDays };
  next();
};




