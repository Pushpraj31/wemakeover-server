import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

class RazorpayService {
  /**
   * Create a new Razorpay order
   * @param {Object} orderData - Order details
   * @param {number} orderData.amount - Amount in paise
   * @param {string} orderData.currency - Currency (default: INR)
   * @param {string} orderData.receipt - Receipt ID
   * @param {Object} orderData.notes - Additional notes
   * @returns {Promise<Object>} Razorpay order response
   */
  static async createOrder(orderData) {
    try {
      const {
        amount,
        currency = 'INR',
        receipt,
        notes = {},
        customer = {}
      } = orderData;

      // Validate required fields
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount provided');
      }

      if (!receipt) {
        throw new Error('Receipt ID is required');
      }

      // Convert amount to paise if it's in rupees
      const amountInPaise = amount * 100;

      // Prepare order options
      const orderOptions = {
        amount: amountInPaise,
        currency,
        receipt,
        notes,
        payment_capture: 1, // Auto capture payment
      };

      // Add customer details if provided
      if (customer.name) {
        orderOptions.notes.customer_name = customer.name;
      }

      if (customer.email) {
        orderOptions.notes.customer_email = customer.email;
      }

      if (customer.phone) {
        orderOptions.notes.customer_phone = customer.phone;
      }

      // Create order with Razorpay
      const order = await razorpay.orders.create(orderOptions);

      return {
        success: true,
        data: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          created_at: order.created_at
        }
      };

    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to create Razorpay order',
        details: error
      };
    }
  }

  /**
   * Verify payment signature
   * @param {string} razorpay_order_id - Razorpay order ID
   * @param {string} razorpay_payment_id - Razorpay payment ID
   * @param {string} razorpay_signature - Razorpay signature
   * @returns {boolean} Verification result
   */
  static verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature) {
    try {
      // Create signature body
      const body = razorpay_order_id + "|" + razorpay_payment_id;

      // Generate expected signature
      const expected_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      // Compare signatures
      const isAuthentic = expected_signature === razorpay_signature;

      return {
        success: isAuthentic,
        message: isAuthentic ? 'Payment verified successfully' : 'Payment verification failed'
      };

    } catch (error) {
      console.error('Payment verification failed:', error);
      
      return {
        success: false,
        error: error.message || 'Payment verification failed'
      };
    }
  }

  /**
   * Get payment details from Razorpay
   * @param {string} paymentId - Razorpay payment ID
   * @returns {Promise<Object>} Payment details
   */
  static async getPaymentDetails(paymentId) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);

      return {
        success: true,
        data: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          description: payment.description,
          vpa: payment.vpa, // For UPI payments
          card: payment.card, // For card payments
          bank: payment.bank, // For net banking
          wallet: payment.wallet, // For wallet payments
          created_at: payment.created_at
        }
      };

    } catch (error) {
      console.error('Failed to fetch payment details:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to fetch payment details'
      };
    }
  }

  /**
   * Get order details from Razorpay
   * @param {string} orderId - Razorpay order ID
   * @returns {Promise<Object>} Order details
   */
  static async getOrderDetails(orderId) {
    try {
      const order = await razorpay.orders.fetch(orderId);

      return {
        success: true,
        data: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          status: order.status,
          receipt: order.receipt,
          notes: order.notes,
          created_at: order.created_at,
          payments: order.payments || []
        }
      };

    } catch (error) {
      console.error('Failed to fetch order details:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to fetch order details'
      };
    }
  }

  /**
   * Create a refund
   * @param {string} paymentId - Razorpay payment ID
   * @param {number} amount - Refund amount in paise
   * @param {string} notes - Refund notes
   * @returns {Promise<Object>} Refund details
   */
  static async createRefund(paymentId, amount, notes = '') {
    try {
      const refund = await razorpay.payments.refund(paymentId, {
        amount: amount,
        notes: {
          reason: notes
        }
      });

      return {
        success: true,
        data: {
          id: refund.id,
          amount: refund.amount,
          status: refund.status,
          notes: refund.notes,
          created_at: refund.created_at
        }
      };

    } catch (error) {
      console.error('Refund creation failed:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to create refund'
      };
    }
  }

  /**
   * Get refund details
   * @param {string} refundId - Razorpay refund ID
   * @returns {Promise<Object>} Refund details
   */
  static async getRefundDetails(refundId) {
    try {
      const refund = await razorpay.refunds.fetch(refundId);

      return {
        success: true,
        data: {
          id: refund.id,
          amount: refund.amount,
          status: refund.status,
          notes: refund.notes,
          created_at: refund.created_at
        }
      };

    } catch (error) {
      console.error('Failed to fetch refund details:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to fetch refund details'
      };
    }
  }

  /**
   * Validate webhook signature
   * @param {string} body - Webhook body
   * @param {string} signature - Webhook signature
   * @returns {boolean} Validation result
   */
  static verifyWebhookSignature(body, signature) {
    try {
      const expected_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      return signature === expected_signature;

    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Get Razorpay instance for advanced operations
   * @returns {Object} Razorpay instance
   */
  static getInstance() {
    return razorpay;
  }
}

export default RazorpayService;
