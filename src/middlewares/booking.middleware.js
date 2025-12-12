import Booking from '../models/booking.model.js';
import { validateIndianPhone } from '../utils/payment.utils.js';
import BookingConfigService from '../services/bookingConfig.service.js';

// Validate booking creation
export const validateBookingCreation = (req, res, next) => {
  const errors = [];
  const { services, bookingDetails, pricing } = req.body;

  // Validate services
  if (!services || !Array.isArray(services) || services.length === 0) {
    errors.push('At least one service is required');
  } else {
    services.forEach((service, index) => {
      if (!service.name || !service.name.trim()) {
        errors.push(`Service ${index + 1}: Name is required`);
      }
      if (!service.description || !service.description.trim()) {
        errors.push(`Service ${index + 1}: Description is required`);
      }
      if (!service.price || service.price <= 0) {
        errors.push(`Service ${index + 1}: Valid price is required`);
      }
      if (!service.quantity || service.quantity < 1) {
        errors.push(`Service ${index + 1}: Valid quantity is required`);
        }
      });
    }
    
  // Validate booking details
  if (!bookingDetails) {
    errors.push('Booking details are required');
  } else {
    // Validate date
    if (!bookingDetails.date) {
      errors.push('Booking date is required');
    } else {
      const bookingDate = new Date(bookingDetails.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (bookingDate < today) {
        errors.push('Booking date cannot be in the past');
      }
    }

    // Validate slot
    if (!bookingDetails.slot || !bookingDetails.slot.trim()) {
      errors.push('Booking slot is required');
    }

    // Validate duration
    if (!bookingDetails.duration || bookingDetails.duration < 15) {
      errors.push('Booking duration must be at least 15 minutes');
    }

    // Validate address
    if (!bookingDetails.address) {
      errors.push('Booking address is required');
    } else {
      const { address } = bookingDetails;
      
      if (!address.houseFlatNumber || !address.houseFlatNumber.trim()) {
        errors.push('House/Flat number is required');
      }
      if (!address.streetAreaName || !address.streetAreaName.trim()) {
        errors.push('Street/Area name is required');
      }
      if (!address.completeAddress || !address.completeAddress.trim()) {
        errors.push('Complete address is required');
      }
      if (!address.city || !address.city.trim()) {
        errors.push('City is required');
      }
      if (!address.state || !address.state.trim()) {
        errors.push('State is required');
      }
      if (!address.pincode || !/^[1-9][0-9]{5}$/.test(address.pincode)) {
        errors.push('Valid 6-digit pincode is required');
      }
      if (!address.phone || !validateIndianPhone(address.phone)) {
        errors.push('Valid 10-digit phone number is required');
      }
    }
  }

  // Validate pricing
  if (!pricing) {
    errors.push('Pricing details are required');
  } else {
    if (!pricing.subtotal || pricing.subtotal <= 0) {
      errors.push('Valid subtotal is required');
    }
    if (pricing.taxAmount === undefined || pricing.taxAmount < 0) {
      errors.push('Valid tax amount is required');
    }
    if (!pricing.totalAmount || pricing.totalAmount <= 0) {
      errors.push('Valid total amount is required');
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

// Validate booking update (reschedule/cancel)
export const validateBookingUpdate = (req, res, next) => {
  const errors = [];
  const { action } = req.body;

  if (!action || !['cancel', 'reschedule'].includes(action)) {
    errors.push('Valid action (cancel or reschedule) is required');
  }

  if (action === 'reschedule') {
    const { newDate, newSlot } = req.body;
    
    if (!newDate) {
      errors.push('New booking date is required for reschedule');
    } else {
      const bookingDate = new Date(newDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (bookingDate < today) {
        errors.push('New booking date cannot be in the past');
      }
    }

    if (!newSlot || !newSlot.trim()) {
      errors.push('New booking slot is required for reschedule');
    }
  }

  if (action === 'cancel') {
    const { cancellationReason } = req.body;
    if (!cancellationReason || !cancellationReason.trim()) {
      errors.push('Cancellation reason is required');
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

// Check if user owns the booking
export const checkBookingOwnership = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check ownership
    if (booking.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own bookings.'
      });
    }

    // Attach booking to request for use in controllers
    req.booking = booking;
    next();
  } catch (error) {
    console.error('Error checking booking ownership:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Check if booking can be modified
export const checkBookingModifiable = (req, res, next) => {
  const booking = req.booking;
  const { action } = req.body;

  if (!booking) {
    return res.status(404).json({
        success: false,
      message: 'Booking not found'
    });
  }

  // Check if booking is in a modifiable state
  if (['completed', 'cancelled', 'no_show'].includes(booking.status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot ${action} a booking with status: ${booking.status}`
    });
  }

  // Check specific action requirements
  if (action === 'cancel') {
    if (!booking.canBeCancelled) {
      return res.status(400).json({
        success: false,
        message: 'This booking cannot be cancelled. Cancellation must be done at least 2 hours before the booking time.'
        });
      }
    }
    
  if (action === 'reschedule') {
    if (!booking.canBeRescheduled) {
      let message = 'This booking cannot be rescheduled.';
      
      if (booking.reschedulingDetails.rescheduleCount >= 3) {
        message += ' Maximum reschedule limit (3) has been reached.';
      } else {
        message += ' Rescheduling must be done at least 4 hours before the booking time.';
      }
      
      return res.status(400).json({
        success: false,
        message
        });
      }
    }
    
    next();
};

// Check time slot availability (basic check)
export const checkSlotAvailability = async (req, res, next) => {
  try {
    const { newDate, newSlot } = req.body;
    const booking = req.booking;

    if (!newDate || !newSlot) {
      return next(); // Let other middleware handle missing data
    }

    // Check if there are conflicting bookings
    const conflictingBookings = await Booking.find({
      _id: { $ne: booking._id }, // Exclude current booking
      'bookingDetails.date': new Date(newDate),
      'bookingDetails.slot': newSlot,
      status: { $in: ['confirmed', 'pending'] }
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose a different time.'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error checking slot availability:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Rate limiting for booking operations
export const rateLimitBookingOperations = (req, res, next) => {
  // This would integrate with a rate limiting library like express-rate-limit
  // For now, we'll implement a simple check
  
    const userId = req.user.id;
  const action = req.body.action;
  
  // In a real implementation, you'd store this in Redis or memory
  // and check against user's recent actions
  
  next();
};

// Sanitize booking data
export const sanitizeBookingData = (req, res, next) => {
  // Sanitize string inputs
  const sanitizeString = (str) => {
    if (typeof str === 'string') {
      return str.trim().replace(/[<>]/g, '');
    }
    return str;
  };

  // Sanitize services
  if (req.body.services) {
    req.body.services = req.body.services.map(service => ({
      ...service,
      name: sanitizeString(service.name),
      description: sanitizeString(service.description),
      category: sanitizeString(service.category)
    }));
  }

  // Sanitize booking details
  if (req.body.bookingDetails && req.body.bookingDetails.address) {
    const address = req.body.bookingDetails.address;
    req.body.bookingDetails.address = {
      ...address,
      houseFlatNumber: sanitizeString(address.houseFlatNumber),
      streetAreaName: sanitizeString(address.streetAreaName),
      completeAddress: sanitizeString(address.completeAddress),
      landmark: sanitizeString(address.landmark),
      city: sanitizeString(address.city),
      state: sanitizeString(address.state),
      country: sanitizeString(address.country)
    };
  }

  // Sanitize notes
  if (req.body.notes) {
    req.body.notes = {
      customer: sanitizeString(req.body.notes.customer),
      admin: sanitizeString(req.body.notes.admin)
    };
  }

    next();
};

// Validate pagination parameters
export const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  if (page < 1) {
      return res.status(400).json({
        success: false,
      message: 'Page number must be greater than 0'
      });
    }
    
  if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
      message: 'Limit must be between 1 and 100'
    });
  }
  
  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit
  };
  
  next();
};

// Validate booking filters
export const validateBookingFilters = (req, res, next) => {
  const { status, dateFrom, dateTo, service } = req.query;
  
  const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
  
  if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
      message: `Invalid status filter. Valid options: ${validStatuses.join(', ')}`
        });
    }
    
  if (dateFrom && isNaN(new Date(dateFrom).getTime())) {
        return res.status(400).json({
          success: false,
      message: 'Invalid dateFrom format'
    });
  }
  
  if (dateTo && isNaN(new Date(dateTo).getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid dateTo format'
    });
  }
  
  req.filters = {
    status,
    dateFrom: dateFrom ? new Date(dateFrom) : null,
    dateTo: dateTo ? new Date(dateTo) : null,
    service
  };
  
  next();
};

// Check minimum order value
export const checkMinimumOrderValue = async (req, res, next) => {
  try {
    console.log('🔍 [MOV CHECK] Starting minimum order value validation...');
    
    // 1. Fetch MOV config from cache/DB
    const movResult = await BookingConfigService.getConfigByKey('MINIMUM_ORDER_VALUE');
    
    // 2. If config not found or inactive, skip validation (fail open)
    if (!movResult.success || !movResult.data || !movResult.data.isActive) {
      console.log('⚠️ [MOV CHECK] MOV config not found or inactive, skipping validation');
      return next();
    }
    
    const movConfig = movResult.data;
    const minimumOrderValue = movConfig.value;
    
    console.log(`✅ [MOV CHECK] MOV config loaded: ₹${minimumOrderValue} (source: ${movResult.source})`);
    
    // 3. Calculate order subtotal from services
    const { services } = req.body;
    
    if (!services || !Array.isArray(services) || services.length === 0) {
      // Let other middleware handle this validation
      return next();
    }
    
    const subtotal = services.reduce((sum, service) => {
      const price = parseFloat(service.price) || 0;
      const quantity = parseInt(service.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
    
    console.log(`💰 [MOV CHECK] Order subtotal: ₹${subtotal}`);
    
    // 4. Compare with MOV
    if (subtotal < minimumOrderValue) {
      const shortfall = minimumOrderValue - subtotal;
      
      console.log(`❌ [MOV CHECK] Order rejected - Subtotal (₹${subtotal}) < MOV (₹${minimumOrderValue})`);
      
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${minimumOrderValue} is required to place a booking.`,
        error: 'MINIMUM_ORDER_VALUE_NOT_MET',
        details: {
          currentOrderValue: subtotal,
          minimumOrderValue: minimumOrderValue,
          shortfall: shortfall,
          currency: movConfig.currency || 'INR',
          message: `Please add services worth ₹${shortfall} more to proceed with your booking.`
        }
      });
    }
    
    // 5. Validation passed
    console.log(`✅ [MOV CHECK] Validation passed - Subtotal (₹${subtotal}) >= MOV (₹${minimumOrderValue})`);
    next();
    
  } catch (error) {
    console.error('❌ [MOV CHECK] Error checking minimum order value:', error);
    // Fail open - don't block booking if validation fails
    console.log('⚠️ [MOV CHECK] Validation error, allowing booking to proceed (fail open)');
    next();
  }
};