import PaymentService from '../services/payment.service.js';
import { validateAmount, validateIndianPhone } from '../utils/payment.utils.js';

/**
 * Create a new payment order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      services,
      bookingDetails,
      totalAmount,
      subtotal,
      taxAmount,
      userAgent,
      ipAddress
    } = req.body;

    // Validate required fields
    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Services are required'
      });
    }

    if (!bookingDetails || !bookingDetails.date || !bookingDetails.slot) {
      return res.status(400).json({
        success: false,
        message: 'Booking details are required'
      });
    }

    if (!bookingDetails.address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    // Validate amounts
    const amountValidation = validateAmount(totalAmount);
    if (!amountValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: amountValidation.error
      });
    }

    // Validate phone number if provided
    if (bookingDetails.address.phone) {
      if (!validateIndianPhone(bookingDetails.address.phone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        });
      }
    }

    // Prepare payment data
    const paymentData = {
      totalAmount: amountValidation.amount,
      subtotal: subtotal || 0,
      taxAmount: taxAmount || 0,
      userAgent: userAgent || req.get('User-Agent'),
      ipAddress: ipAddress || req.ip || req.connection.remoteAddress
    };

    // Create payment order
    const result = await PaymentService.createPaymentOrder(
      paymentData,
      userId,
      services,
      bookingDetails
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to create payment order'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Payment order created successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Create payment order error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verify payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const verifyPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, paymentId, signature } = req.body;

    // Validate required fields
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Payment ID, and Signature are required'
      });
    }

    // Verify payment
    const result = await PaymentService.verifyPayment(
      { orderId, paymentId, signature },
      userId
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Payment verification failed'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get payment history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters'
      });
    }

    // Get payment history
    const result = await PaymentService.getPaymentHistory(userId, pageNum, limitNum);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to fetch payment history'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment history retrieved successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get payment details by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPaymentDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    // Get payment details
    const result = await PaymentService.getPaymentDetails(paymentId, userId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error || 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment details retrieved successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Get payment details error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cancel payment order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const cancelPaymentOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Cancel payment order
    const result = await PaymentService.cancelPaymentOrder(orderId, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to cancel payment order'
      });
    }

    res.status(200).json({
      success: true,
      message: result.message || 'Payment order cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel payment order error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get payment statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPaymentStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get payment statistics
    const result = await PaymentService.getPaymentStats(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to fetch payment statistics'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment statistics retrieved successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Get payment stats error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create COD (Cash on Delivery) order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createCODOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      services,
      bookingDetails,
      totalAmount,
      subtotal,
      taxAmount
    } = req.body;

    // Validate required fields (same as payment order)
    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Services are required'
      });
    }

    if (!bookingDetails || !bookingDetails.date || !bookingDetails.slot) {
      return res.status(400).json({
        success: false,
        message: 'Booking details are required'
      });
    }

    if (!bookingDetails.address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    // Validate amounts
    const amountValidation = validateAmount(totalAmount);
    if (!amountValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: amountValidation.error
      });
    }

    // Validate phone number if provided
    if (bookingDetails.address.phone) {
      if (!validateIndianPhone(bookingDetails.address.phone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        });
      }
    }

    // Create COD order (without Razorpay integration)
    const result = await PaymentService.createCODOrder(
      {
        totalAmount: amountValidation.amount,
        subtotal: subtotal || 0,
        taxAmount: taxAmount || 0
      },
      userId,
      services,
      bookingDetails
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to create COD order'
      });
    }

    res.status(201).json({
      success: true,
      message: 'COD order created successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Create COD order error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
