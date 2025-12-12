import BookingService from '../services/booking.service.js';
import mongoose from 'mongoose';

/**
 * Create a new booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingData = {
      ...req.body,
      userId
    };

    const result = await BookingService.createBooking(bookingData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      data: result.data,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Error in createBooking controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get all bookings for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      status,
      dateFrom,
      dateTo,
      service,
      page = 1,
      limit = 10
    } = req.query;

    const options = {
      status,
      dateFrom,
      dateTo,
      service,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await BookingService.getUserBookings(userId, options);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getUserBookings controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get a specific booking by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const result = await BookingService.getBookingById(bookingId, userId);

    if (!result.success) {
      const statusCode = result.error === 'NOT_FOUND' ? 404 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getBookingById controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Update booking status (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status, notes } = req.body;
    const updatedBy = req.user.id;

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const result = await BookingService.updateBookingStatus(bookingId, status, updatedBy, notes);

    if (!result.success) {
      const statusCode = result.error === 'NOT_FOUND' ? 404 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in updateBookingStatus controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Cancel a booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { cancellationReason } = req.body;
    const cancelledBy = {
      id: req.user.id,
      role: req.user.role || 'customer'
    };

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }
    
    const result = await BookingService.cancelBooking(bookingId, cancellationReason, cancelledBy);

    if (!result.success) {
      const statusCode = result.error === 'NOT_FOUND' ? 404 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in cancelBooking controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Reschedule a booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const rescheduleBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { newDate, newSlot, newPaymentMethod, reason } = req.body;
    const userId = req.user.id;

    console.log('🔄 Reschedule booking request:', {
      bookingId,
      newDate,
      newSlot,
      newPaymentMethod,
      reason: reason ? 'provided' : 'not provided',
      userId
    });

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
        error: 'INVALID_ID'
      });
    }

    // Validate required fields
    if (!newDate || !newSlot) {
      return res.status(400).json({
        success: false,
        message: 'New date and time slot are required',
        error: 'MISSING_FIELDS'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(newDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Expected YYYY-MM-DD',
        error: 'INVALID_DATE_FORMAT'
      });
    }

    // Validate time slot format (HH:MM AM/PM)
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
    if (!timeRegex.test(newSlot)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time slot format. Expected HH:MM AM/PM',
        error: 'INVALID_TIME_FORMAT'
      });
    }

    // Validate payment method if provided
    if (newPaymentMethod && !['online', 'cod'].includes(newPaymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Must be "online" or "cod"',
        error: 'INVALID_PAYMENT_METHOD'
      });
    }

    // Call service method
    const result = await BookingService.rescheduleBooking(
      bookingId,
      newDate,
      newSlot,
      newPaymentMethod,
      reason,
      userId
    );

    // Handle service errors
    if (!result.success) {
      // Map error codes to HTTP status codes
      const statusCodeMap = {
        'NOT_FOUND': 404,
        'CANNOT_RESCHEDULE': 403,
        'MAX_RESCHEDULES_REACHED': 403,
        'TOO_CLOSE_TO_BOOKING': 403,
        'INVALID_DATE': 400,
        'SLOT_UNAVAILABLE': 409
      };
      
      const statusCode = statusCodeMap[result.error] || 400;
      
      console.log('❌ Reschedule failed:', {
        bookingId,
        error: result.error,
        message: result.message
      });
      
      return res.status(statusCode).json(result);
    }

    console.log('✅ Booking rescheduled successfully:', {
      bookingId,
      orderNumber: result.data.orderNumber,
      rescheduleCount: result.rescheduleCount,
      remainingReschedules: result.remainingReschedules
    });

    // Return success response
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error in rescheduleBooking controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while rescheduling booking',
      error: error.message
    });
  }
};

/**
 * Update payment status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const paymentDetails = req.body;

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const result = await BookingService.updatePaymentStatus(bookingId, paymentDetails);

    if (!result.success) {
      const statusCode = result.error === 'NOT_FOUND' ? 404 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in updatePaymentStatus controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Complete booking payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const completeBookingPayment = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { paymentMethod, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    console.log('💳 Complete payment request received:', {
      bookingId,
      paymentMethod,
      hasRazorpayData: !!(razorpayOrderId && razorpayPaymentId && razorpaySignature)
    });

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
        error: 'INVALID_ID'
      });
    }

    // Validate payment method
    if (!paymentMethod || !['online', 'cod'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Must be "online" or "cod"',
        error: 'INVALID_PAYMENT_METHOD'
      });
    }

    // For online payments, validate Razorpay data
    if (paymentMethod === 'online') {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({
          success: false,
          message: 'Razorpay payment details are required for online payments',
          error: 'MISSING_RAZORPAY_DATA'
        });
      }
    }

    // Prepare Razorpay data if online payment
    const razorpayData = paymentMethod === 'online' ? {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    } : null;

    // Call service to complete payment
    const result = await BookingService.completeBookingPayment(bookingId, paymentMethod, razorpayData);

    // Handle service errors
    if (!result.success) {
      // Map error codes to HTTP status codes
      const statusCodeMap = {
        'NOT_FOUND': 404,
        'ALREADY_PAID': 409,
        'INVALID_PAYMENT_DATA': 400
      };
      
      const statusCode = statusCodeMap[result.error] || 400;
      
      console.log('❌ Payment completion failed:', {
        bookingId,
        error: result.error,
        message: result.message
      });
      
      return res.status(statusCode).json(result);
    }

    console.log('✅ Payment completed successfully:', {
      bookingId,
      orderNumber: result.data.orderNumber,
      paymentMethod,
      paymentStatus: result.data.paymentStatus
    });

    // Return success response
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error in completeBookingPayment controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while completing payment',
      error: error.message
    });
  }
};

/**
 * Get booking statistics for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getBookingStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await BookingService.getBookingStats(userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getBookingStats controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get upcoming bookings for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUpcomingBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;

    const result = await BookingService.getUpcomingBookings(userId, limit);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getUpcomingBookings controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Search bookings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q: searchQuery, status, dateFrom, dateTo, page = 1, limit = 10 } = req.query;

    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const options = {
      status,
      dateFrom,
      dateTo,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await BookingService.searchBookings(userId, searchQuery.trim(), options);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in searchBookings controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get booking analytics (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getBookingAnalytics = async (req, res) => {
  try {
    const { dateFrom, dateTo, status } = req.query;

    const filters = {
      dateFrom,
      dateTo,
      status
    };

    const result = await BookingService.getBookingAnalytics(filters);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getBookingAnalytics controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get available time slots for a specific date
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const bookingDate = new Date(date);
    
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Get all time slots (you can customize this based on your business hours)
    const allSlots = [
      '09:00 AM - 09:45 AM',
      '10:00 AM - 10:45 AM',
      '11:00 AM - 11:45 AM',
      '12:00 PM - 12:45 PM',
      '01:00 PM - 01:45 PM',
      '02:00 PM - 02:45 PM',
      '03:00 PM - 03:45 PM',
      '04:00 PM - 04:45 PM',
      '05:00 PM - 05:45 PM',
      '06:00 PM - 06:45 PM'
    ];

    // Find booked slots for the date
    const bookedSlots = await Booking.find({
      'bookingDetails.date': bookingDate,
      status: { $in: ['confirmed', 'pending'] }
    }).select('bookingDetails.slot');

    const bookedSlotStrings = bookedSlots.map(booking => booking.bookingDetails.slot);
    
    // Filter available slots
    const availableSlots = allSlots.filter(slot => !bookedSlotStrings.includes(slot));

    res.status(200).json({
      success: true,
      data: {
        date: bookingDate.toISOString().split('T')[0],
        availableSlots,
        bookedSlots: bookedSlotStrings,
        totalSlots: allSlots.length,
        availableCount: availableSlots.length
      },
      message: 'Available slots retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getAvailableSlots controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};