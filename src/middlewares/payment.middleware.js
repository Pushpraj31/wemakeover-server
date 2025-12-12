import { validateAmount, validateIndianPhone } from '../utils/payment.utils.js';

/**
 * Validate payment order creation data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const validatePaymentOrder = (req, res, next) => {
  try {
    const { services, bookingDetails, booking, totalAmount, subtotal, taxAmount } = req.body;
    
    console.log('🔍 [SERVER DEBUG] Received payment order data:', {
      hasBookingDetails: !!bookingDetails,
      hasBooking: !!booking,
      bookingDetails: bookingDetails,
      booking: booking,
      servicesCount: services?.length,
      totalAmount: totalAmount,
      timestamp: new Date().toISOString()
    });
    
    // Handle both old format (bookingDetails) and new format (booking)
    const bookingData = bookingDetails || booking;
    
    console.log('🔍 [SERVER DEBUG] Using booking data:', {
      bookingData: bookingData,
      hasBookingData: !!bookingData
    });

    // Validate services array
    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Services array is required and must not be empty'
      });
    }

    // Validate each service
    for (const service of services) {
      if (!service.id || !service.name || !service.price || !service.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Each service must have id, name, price, and quantity'
        });
      }

      // Validate service price
      const priceValidation = validateAmount(service.price);
      if (!priceValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for service: ${service.name}`
        });
      }

      // Validate quantity
      if (service.quantity < 1 || service.quantity > 10) {
        return res.status(400).json({
          success: false,
          message: `Quantity for service ${service.name} must be between 1 and 10`
        });
      }
    }

    // Validate booking details
    if (!bookingData) {
      return res.status(400).json({
        success: false,
        message: 'Booking details are required'
      });
    }

    // Validate booking date
    if (!bookingData.date) {
      return res.status(400).json({
        success: false,
        message: 'Booking date is required'
      });
    }

    const bookingDate = new Date(bookingData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Allow today's bookings but check time slot
    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Booking date cannot be in the past'
      });
    }

    // If it's today, validate that the time slot is reasonable
    if (bookingDate.getTime() === today.getTime()) {
      // For today's bookings, we'll let the time slot validation handle it
      // The frontend should already validate 30-minute advance booking
      console.log('Today booking detected, proceeding with validation');
    }

    // Validate booking slot
    if (!bookingData.slot) {
      return res.status(400).json({
        success: false,
        message: 'Booking slot is required'
      });
    }

    // Validate address
    if (!bookingData.address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    const { address } = bookingData;
    if (!address.street || !address.city || !address.state || !address.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Complete address (street, city, state, pincode) is required'
      });
    }

    // Validate phone number
    if (address.phone && !validateIndianPhone(address.phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Validate pincode (6 digits)
    if (!/^\d{6}$/.test(address.pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Pincode must be 6 digits'
      });
    }

    // Validate amounts
    const totalAmountValidation = validateAmount(totalAmount);
    if (!totalAmountValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: totalAmountValidation.error
      });
    }

    if (subtotal !== undefined) {
      const subtotalValidation = validateAmount(subtotal);
      if (!subtotalValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: subtotalValidation.error
        });
      }
    }

    if (taxAmount !== undefined) {
      const taxValidation = validateAmount(taxAmount);
      if (!taxValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: taxValidation.error
        });
      }
    }

    // Validate amount consistency
    if (subtotal && taxAmount && totalAmount) {
      const calculatedTotal = subtotal + taxAmount;
      if (Math.abs(calculatedTotal - totalAmount) > 1) { // Allow 1 rupee difference for rounding
        return res.status(400).json({
          success: false,
          message: 'Total amount does not match subtotal + tax'
        });
      }
    }

    next();

  } catch (error) {
    console.error('Payment validation error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Validation error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Validate payment verification data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const validatePaymentVerification = (req, res, next) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    // Validate required fields
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment signature is required'
      });
    }

    // Validate format (basic validation)
    if (typeof orderId !== 'string' || orderId.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    if (typeof paymentId !== 'string' || paymentId.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID format'
      });
    }

    if (typeof signature !== 'string' || signature.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature format'
      });
    }

    next();

  } catch (error) {
    console.error('Payment verification validation error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Validation error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Validate pagination parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const validatePagination = (req, res, next) => {
  try {
    const { page, limit } = req.query;

    // Validate page
    if (page !== undefined) {
      const pageNum = parseInt(page);
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'Page must be a positive integer'
        });
      }
    }

    // Validate limit
    if (limit !== undefined) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Limit must be between 1 and 100'
        });
      }
    }

    next();

  } catch (error) {
    console.error('Pagination validation error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Validation error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Sanitize payment data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const sanitizePaymentData = (req, res, next) => {
  try {
    // Sanitize services data
    if (req.body.services) {
      req.body.services = req.body.services.map(service => ({
        id: String(service.id).trim(),
        name: String(service.name).trim(),
        description: String(service.description || '').trim(),
        price: parseFloat(service.price) || 0,
        quantity: parseInt(service.quantity) || 1,
        image: String(service.image || '').trim(),
        category: String(service.category || 'Regular').trim(),
        duration: String(service.duration || '60').trim()
      }));
    }

    // Sanitize booking details (handle both old and new format)
    const bookingDataToSanitize = req.body.bookingDetails || req.body.booking;
    if (bookingDataToSanitize) {
      const bookingDetails = bookingDataToSanitize;
      
      // Sanitize address
      if (bookingDetails.address) {
        bookingDetails.address = {
          street: String(bookingDetails.address.street || '').trim(),
          city: String(bookingDetails.address.city || '').trim(),
          state: String(bookingDetails.address.state || '').trim(),
          pincode: String(bookingDetails.address.pincode || '').trim(),
          phone: String(bookingDetails.address.phone || '').trim(),
          landmark: String(bookingDetails.address.landmark || '').trim()
        };
      }

      // Sanitize other booking fields
      bookingDetails.date = String(bookingDetails.date || '').trim();
      bookingDetails.slot = String(bookingDetails.slot || '').trim();
      bookingDetails.notes = String(bookingDetails.notes || '').trim();
    }

    // Sanitize amounts
    if (req.body.totalAmount !== undefined) {
      req.body.totalAmount = parseFloat(req.body.totalAmount) || 0;
    }

    if (req.body.subtotal !== undefined) {
      req.body.subtotal = parseFloat(req.body.subtotal) || 0;
    }

    if (req.body.taxAmount !== undefined) {
      req.body.taxAmount = parseFloat(req.body.taxAmount) || 0;
    }

    next();

  } catch (error) {
    console.error('Data sanitization error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Data sanitization error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Rate limiting for payment endpoints
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const paymentRateLimit = (req, res, next) => {
  // Simple in-memory rate limiting (in production, use Redis)
  const userId = req.user?.id;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 10; // Max 10 payment attempts per 15 minutes

  if (!req.rateLimitMap) {
    req.rateLimitMap = new Map();
  }

  const key = `payment_${userId}`;
  const userRequests = req.rateLimitMap.get(key) || [];

  // Remove old requests outside the window
  const validRequests = userRequests.filter(time => now - time < windowMs);

  if (validRequests.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many payment attempts. Please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }

  // Add current request
  validRequests.push(now);
  req.rateLimitMap.set(key, validRequests);

  next();
};

/**
 * Validate payment amount consistency
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const validateAmountConsistency = (req, res, next) => {
  try {
    const { services, pricing, totalAmount, subtotal, taxAmount } = req.body;
    
    // Handle both old format (direct amounts) and new format (pricing object)
    const finalTotalAmount = totalAmount || pricing?.totalAmount;
    const finalSubtotal = subtotal || pricing?.subtotal;
    const finalTaxAmount = taxAmount || pricing?.taxAmount;

    if (services && finalTotalAmount) {
      // Calculate expected subtotal from services
      const calculatedSubtotal = services.reduce((sum, service) => {
        return sum + (service.price * service.quantity);
      }, 0);

      // Check if provided subtotal matches calculated subtotal
      if (finalSubtotal !== undefined) {
        const difference = Math.abs(finalSubtotal - calculatedSubtotal);
        if (difference > 1) { // Allow 1 rupee difference for rounding
          return res.status(400).json({
            success: false,
            message: 'Subtotal does not match services total'
          });
        }
      }

      // Check if total amount is reasonable
      if (finalTaxAmount !== undefined) {
        const expectedTotal = calculatedSubtotal + finalTaxAmount;
        const totalDifference = Math.abs(finalTotalAmount - expectedTotal);
        if (totalDifference > 1) { // Allow 1 rupee difference for rounding
          return res.status(400).json({
            success: false,
            message: 'Total amount does not match subtotal + tax'
          });
        }
      }
    }

    next();

  } catch (error) {
    console.error('Amount consistency validation error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Validation error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
