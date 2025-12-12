import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentDetails,
  cancelPaymentOrder,
  getPaymentStats,
  createCODOrder
} from '../controllers/payment.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import {
  validatePaymentOrder,
  validatePaymentVerification,
  validatePagination,
  sanitizePaymentData,
  paymentRateLimit,
  validateAmountConsistency
} from '../middlewares/payment.middleware.js';
import { validateServiceableCity } from '../middleware/validateServiceableCity.js';

const router = express.Router();

// All payment routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/payment/create-order
 * @desc    Create a new Razorpay payment order
 * @access  Private
 */
router.post('/create-order',
  sanitizePaymentData,
  validateServiceableCity, // ✅ City validation added
  validatePaymentOrder,
  validateAmountConsistency,
  paymentRateLimit,
  createPaymentOrder
);

/**
 * @route   POST /api/payment/verify
 * @desc    Verify Razorpay payment
 * @access  Private
 */
router.post('/verify',
  validatePaymentVerification,
  paymentRateLimit,
  verifyPayment
);

/**
 * @route   POST /api/payment/create-cod
 * @desc    Create Cash on Delivery order
 * @access  Private
 */
router.post('/create-cod',
  sanitizePaymentData,
  validateServiceableCity, // ✅ City validation added
  validatePaymentOrder,
  validateAmountConsistency,
  createCODOrder
);

/**
 * @route   GET /api/payment/history
 * @desc    Get user's payment history
 * @access  Private
 */
router.get('/history',
  validatePagination,
  getPaymentHistory
);

/**
 * @route   GET /api/payment/:paymentId
 * @desc    Get payment details by ID
 * @access  Private
 */
router.get('/:paymentId',
  getPaymentDetails
);

/**
 * @route   POST /api/payment/cancel
 * @desc    Cancel a payment order
 * @access  Private
 */
router.post('/cancel',
  cancelPaymentOrder
);

/**
 * @route   GET /api/payment/stats/overview
 * @desc    Get user's payment statistics
 * @access  Private
 */
router.get('/stats/overview',
  getPaymentStats
);

export default router;
