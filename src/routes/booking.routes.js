import express from 'express';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking,
  updatePaymentStatus,
  completeBookingPayment,
  getBookingStats,
  getUpcomingBookings,
  searchBookings,
  getBookingAnalytics,
  getAvailableSlots
} from '../controllers/booking.controller.js';

import { authenticateToken } from '../middlewares/auth.middleware.js';
import {
  validateBookingCreation,
  validateBookingUpdate,
  checkBookingOwnership,
  checkBookingModifiable,
  checkSlotAvailability,
  sanitizeBookingData,
  validatePagination,
  validateBookingFilters,
  checkMinimumOrderValue
} from '../middlewares/booking.middleware.js';
import {
  getServiceableCities,
  checkCityServiceability,
  checkLocationServiceability
} from '../controllers/serviceableCity.controller.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

/**
 * @route   GET /api/bookings/serviceable-cities
 * @desc    Get list of all serviceable cities
 * @access  Public
 * @response Array of active serviceable cities
 */
router.get('/serviceable-cities', getServiceableCities);

/**
 * @route   POST /api/bookings/check-serviceability
 * @desc    Check if a specific city is serviceable
 * @access  Public
 * @body    city (required)
 * @response Serviceability status and details
 */
router.post('/check-serviceability', checkCityServiceability);

/**
 * @route   POST /api/bookings/check-location-serviceability
 * @desc    Check if both city and pincode are serviceable
 * @access  Public
 * @body    city (required), pincode (required)
 * @response Location serviceability status with detailed feedback
 */
router.post('/check-location-serviceability', checkLocationServiceability);

// ============================================
// AUTHENTICATED ROUTES (require login)
// ============================================

// Apply authentication to all booking routes
router.use(authenticateToken);

// Public routes (authenticated users only)

/**
 * @route   GET /api/bookings/my-bookings
 * @desc    Get all bookings for the authenticated user
 * @access  Private
 * @query   status, dateFrom, dateTo, service, page, limit
 */
router.get('/my-bookings',
  validatePagination,
  validateBookingFilters,
  getUserBookings
);

/**
 * @route   GET /api/bookings/upcoming
 * @desc    Get upcoming bookings for the authenticated user
 * @access  Private
 * @query   limit
 */
router.get('/upcoming',
  getUpcomingBookings
);

/**
 * @route   GET /api/bookings/stats
 * @desc    Get booking statistics for the authenticated user
 * @access  Private
 */
router.get('/stats',
  getBookingStats
);

/**
 * @route   GET /api/bookings/search
 * @desc    Search bookings for the authenticated user
 * @access  Private
 * @query   q (search query), status, dateFrom, dateTo, page, limit
 */
router.get('/search',
  validatePagination,
  validateBookingFilters,
  searchBookings
);

/**
 * @route   GET /api/bookings/available-slots
 * @desc    Get available time slots for a specific date
 * @access  Private
 * @query   date
 */
router.get('/available-slots',
  getAvailableSlots
);

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private
 * @body    services, bookingDetails, pricing
 * @validation
 *   - Sanitizes booking data
 *   - Validates all required fields
 *   - Checks minimum order value (MOV)
 *   - Creates booking if all validations pass
 */
router.post('/',
  sanitizeBookingData,
  validateBookingCreation,
  checkMinimumOrderValue,  // ⬅️ NEW: Check MOV before creating booking
  createBooking
);

// Routes requiring booking ID parameter

/**
 * @route   GET /api/bookings/:id
 * @desc    Get a specific booking by ID
 * @access  Private (user can only access their own bookings)
 */
router.get('/:id',
  checkBookingOwnership,
  getBookingById
);

/**
 * @route   PUT /api/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private (user can only cancel their own bookings)
 * @body    cancellationReason
 */
router.put('/:id/cancel',
  checkBookingOwnership,
  checkBookingModifiable,
  sanitizeBookingData,
  cancelBooking
);

/**
 * @route   PATCH /api/bookings/:id/reschedule
 * @desc    Reschedule a booking
 * @access  Private (user can only reschedule their own bookings)
 * @body    newDate, newSlot, newPaymentMethod (optional), reason (optional)
 * @validation
 *   - newDate: Required, YYYY-MM-DD format
 *   - newSlot: Required, HH:MM AM/PM format
 *   - newPaymentMethod: Optional, "online" or "cod"
 *   - reason: Optional, string (max 500 chars)
 * @rules
 *   - Booking must be >4 hours away
 *   - Maximum 3 reschedules allowed
 *   - New date must be >4 hours from now
 *   - Time slot must be available
 */
router.patch('/:id/reschedule',
  checkBookingOwnership,
  sanitizeBookingData,
  rescheduleBooking
);

/**
 * @route   PUT /api/bookings/:id/payment-status
 * @desc    Update payment status for a booking
 * @access  Private (user can only update their own bookings)
 * @body    paymentDetails
 */
router.put('/:id/payment-status',
  checkBookingOwnership,
  updatePaymentStatus
);

/**
 * @route   POST /api/bookings/:id/complete-payment
 * @desc    Complete payment for a booking
 * @access  Private (user can only complete payment for their own bookings)
 * @body    paymentMethod, razorpayOrderId (optional), razorpayPaymentId (optional), razorpaySignature (optional)
 * @validation
 *   - paymentMethod: Required, "online" or "cod"
 *   - For online: razorpayOrderId, razorpayPaymentId, razorpaySignature are required
 *   - For COD: only paymentMethod is required
 * @rules
 *   - Booking must exist
 *   - Payment must not already be completed
 *   - For online: Razorpay signature will be verified
 * @response
 *   - Success: Updated booking with payment status
 *   - Sends confirmation emails for online payments
 */
router.post('/:id/complete-payment',
  checkBookingOwnership,
  sanitizeBookingData,
  completeBookingPayment
);

// Admin-only routes (you can add admin middleware here)

/**
 * @route   PUT /api/bookings/:id/status
 * @desc    Update booking status (admin only)
 * @access  Private (admin only)
 * @body    status, notes
 */
router.put('/:id/status',
  // Add admin middleware here: requireAdmin,
  updateBookingStatus
);

/**
 * @route   GET /api/bookings/analytics/overview
 * @desc    Get booking analytics (admin only)
 * @access  Private (admin only)
 * @query   dateFrom, dateTo, status
 */
router.get('/analytics/overview',
  // Add admin middleware here: requireAdmin,
  getBookingAnalytics
);

export default router;