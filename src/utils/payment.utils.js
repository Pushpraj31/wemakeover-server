import crypto from 'crypto';

/**
 * Generate a unique receipt ID for orders
 * @returns {string} Unique receipt ID
 */
export const generateReceiptId = () => {
  const timestamp = Date.now().toString();
  const randomString = crypto.randomBytes(4).toString('hex');
  return `RCP_${timestamp}_${randomString}`.toUpperCase();
};

/**
 * Generate a unique order ID
 * @returns {string} Unique order ID
 */
export const generateOrderId = () => {
  const timestamp = Date.now().toString();
  const randomString = crypto.randomBytes(6).toString('hex');
  return `ORD_${timestamp}_${randomString}`.toUpperCase();
};

/**
 * Convert amount from rupees to paise
 * @param {number} amountInRupees - Amount in rupees
 * @returns {number} Amount in paise
 */
export const convertToPaise = (amountInRupees) => {
  return Math.round(amountInRupees * 100);
};

/**
 * Convert amount from paise to rupees
 * @param {number} amountInPaise - Amount in paise
 * @returns {number} Amount in rupees
 */
export const convertToRupees = (amountInPaise) => {
  return amountInPaise / 100;
};

/**
 * Calculate tax amount
 * @param {number} subtotal - Subtotal amount
 * @param {number} taxRate - Tax rate (default: 18%)
 * @returns {number} Tax amount
 */
export const calculateTax = (subtotal, taxRate = 18) => {
  return Math.round((subtotal * taxRate) / 100);
};

/**
 * Calculate total amount including tax
 * @param {number} subtotal - Subtotal amount
 * @param {number} taxRate - Tax rate (default: 18%)
 * @returns {number} Total amount including tax
 */
export const calculateTotal = (subtotal, taxRate = 18) => {
  const taxAmount = calculateTax(subtotal, taxRate);
  return subtotal + taxAmount;
};

/**
 * Format amount for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} Formatted amount
 */
export const formatAmount = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Validate payment amount
 * @param {number} amount - Amount to validate
 * @returns {Object} Validation result
 */
export const validateAmount = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return {
      isValid: false,
      error: 'Amount must be a valid number'
    };
  }

  if (amount <= 0) {
    return {
      isValid: false,
      error: 'Amount must be greater than zero'
    };
  }

  if (amount > 1000000) { // 10 lakh rupees
    return {
      isValid: false,
      error: 'Amount cannot exceed ₹10,00,000'
    };
  }

  return {
    isValid: true,
    amount: Math.round(amount)
  };
};

/**
 * Validate UPI ID format
 * @param {string} upiId - UPI ID to validate
 * @returns {boolean} Validation result
 */
export const validateUpiId = (upiId) => {
  if (!upiId || typeof upiId !== 'string') {
    return false;
  }

  // UPI ID format: user@bank or user@upi
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{2,}$/;
  return upiRegex.test(upiId);
};

/**
 * Validate card number format (basic validation)
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} Validation result
 */
export const validateCardNumber = (cardNumber) => {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return false;
  }

  // Remove spaces and non-digits
  const cleanedNumber = cardNumber.replace(/\D/g, '');
  
  // Check if it's 13-19 digits (standard card lengths)
  if (cleanedNumber.length < 13 || cleanedNumber.length > 19) {
    return false;
  }

  // Luhn algorithm validation
  return validateLuhnAlgorithm(cleanedNumber);
};

/**
 * Luhn algorithm for card number validation
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} Validation result
 */
const validateLuhnAlgorithm = (cardNumber) => {
  let sum = 0;
  let isEven = false;

  // Process digits from right to left
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Mask sensitive payment data
 * @param {string} data - Data to mask
 * @param {number} visibleChars - Number of characters to show at start
 * @param {number} visibleEndChars - Number of characters to show at end
 * @returns {string} Masked data
 */
export const maskSensitiveData = (data, visibleChars = 4, visibleEndChars = 4) => {
  if (!data || data.length <= visibleChars + visibleEndChars) {
    return data;
  }

  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleEndChars);
  const middle = '*'.repeat(data.length - visibleChars - visibleEndChars);

  return start + middle + end;
};

/**
 * Generate payment reference number
 * @returns {string} Payment reference number
 */
export const generatePaymentReference = () => {
  const timestamp = Date.now().toString();
  const randomString = crypto.randomBytes(3).toString('hex');
  return `PAY_${timestamp}_${randomString}`.toUpperCase();
};

/**
 * Validate phone number for Indian format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Validation result
 */
export const validateIndianPhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove all non-digits
  const cleanedPhone = phone.replace(/\D/g, '');

  // Indian phone number: 10 digits starting with 6-9
  const indianPhoneRegex = /^[6-9]\d{9}$/;
  return indianPhoneRegex.test(cleanedPhone);
};

/**
 * Get payment method display name
 * @param {string} method - Payment method code
 * @returns {string} Display name
 */
export const getPaymentMethodDisplayName = (method) => {
  const methodNames = {
    'card': 'Credit/Debit Card',
    'upi': 'UPI',
    'netbanking': 'Net Banking',
    'wallet': 'Wallet',
    'emi': 'EMI',
    'cod': 'Cash on Delivery'
  };

  return methodNames[method] || method;
};

/**
 * Check if payment method is online
 * @param {string} method - Payment method
 * @returns {boolean} True if online payment
 */
export const isOnlinePayment = (method) => {
  const onlineMethods = ['card', 'upi', 'netbanking', 'wallet', 'emi'];
  return onlineMethods.includes(method);
};

/**
 * Generate order summary text
 * @param {Array} services - Services array
 * @returns {string} Order summary
 */
export const generateOrderSummary = (services) => {
  if (!services || services.length === 0) {
    return 'No services selected';
  }

  if (services.length === 1) {
    return services[0].name;
  }

  if (services.length === 2) {
    return `${services[0].name} and ${services[1].name}`;
  }

  return `${services[0].name} and ${services.length - 1} other services`;
};

/**
 * Calculate service duration in minutes
 * @param {Array} services - Services array
 * @returns {number} Total duration in minutes
 */
export const calculateServiceDuration = (services) => {
  if (!services || services.length === 0) {
    return 0;
  }

  return services.reduce((total, service) => {
    const duration = parseInt(service.duration) || 60; // Default 60 minutes
    return total + (duration * service.quantity);
  }, 0);
};

/**
 * Format duration for display
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
};

/**
 * Get payment status display name
 * @param {string} status - Payment status
 * @returns {string} Display name
 */
export const getPaymentStatusDisplayName = (status) => {
  const statusNames = {
    'created': 'Order Created',
    'attempted': 'Payment Attempted',
    'paid': 'Payment Successful',
    'failed': 'Payment Failed',
    'cancelled': 'Payment Cancelled'
  };

  return statusNames[status] || status;
};

/**
 * Check if payment is in terminal state
 * @param {string} status - Payment status
 * @returns {boolean} True if terminal state
 */
export const isTerminalPaymentStatus = (status) => {
  const terminalStatuses = ['paid', 'failed', 'cancelled'];
  return terminalStatuses.includes(status);
};
