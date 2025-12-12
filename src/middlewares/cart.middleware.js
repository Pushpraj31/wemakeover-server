import Cart from '../models/cart.model.js';

// Validation middleware for cart item
export const validateCartItem = (req, res, next) => {
  const errors = [];
  
  // Required fields validation
  const requiredFields = ['serviceId', 'cardHeader', 'description', 'price', 'img', 'category'];
  requiredFields.forEach(field => {
    if (!req.body[field]) {
      errors.push(`${field} is required`);
    }
  });
  
  // Data type validation
  if (req.body.price && (isNaN(req.body.price) || req.body.price < 0)) {
    errors.push('Price must be a positive number');
  }
  
  if (req.body.quantity && (isNaN(req.body.quantity) || req.body.quantity < 1 || req.body.quantity > 10)) {
    errors.push('Quantity must be between 1 and 10');
  }
  
  if (req.body.serviceId && typeof req.body.serviceId !== 'string') {
    errors.push('Service ID must be a string');
  }
  
  if (req.body.cardHeader && typeof req.body.cardHeader !== 'string') {
    errors.push('Service name must be a string');
  }
  
  if (req.body.description && typeof req.body.description !== 'string') {
    errors.push('Description must be a string');
  }
  
  // String length validation
  if (req.body.cardHeader && req.body.cardHeader.length > 100) {
    errors.push('Service name cannot exceed 100 characters');
  }
  
  if (req.body.description && req.body.description.length > 500) {
    errors.push('Description cannot exceed 500 characters');
  }
  
  // Category validation
  const validCategories = ['Regular', 'Premium', 'Bridal', 'Classic', 'default'];
  if (req.body.category && !validCategories.includes(req.body.category)) {
    errors.push('Category must be one of: Regular, Premium, Bridal, Classic, default');
  }
  
  // Service type validation
  const validServiceTypes = ['Standard', 'Premium', 'Deluxe'];
  if (req.body.serviceType && !validServiceTypes.includes(req.body.serviceType)) {
    errors.push('Service type must be one of: Standard, Premium, Deluxe');
  }
  
  // Boolean validation
  if (req.body.taxIncluded !== undefined && typeof req.body.taxIncluded !== 'boolean') {
    errors.push('taxIncluded must be a boolean value');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }
  
  next();
};

// Validation middleware for cart update
export const validateCartUpdate = (req, res, next) => {
  const errors = [];
  
  // Check if items array is provided
  if (!req.body.items || !Array.isArray(req.body.items)) {
    errors.push('Items must be an array');
  }
  
  if (req.body.items && Array.isArray(req.body.items)) {
    // Validate each item in the array
    req.body.items.forEach((item, index) => {
        const requiredFields = ['serviceId', 'cardHeader', 'description', 'price', 'img', 'category'];
        requiredFields.forEach(field => {
          if (!item[field]) {
            errors.push(`Item ${index + 1}: ${field} is required`);
          }
        });
      
      // Data type validation for each item
      if (item.price && (isNaN(item.price) || item.price < 0)) {
        errors.push(`Item ${index + 1}: Price must be a positive number`);
      }
      
      if (item.quantity && (isNaN(item.quantity) || item.quantity < 1 || item.quantity > 10)) {
        errors.push(`Item ${index + 1}: Quantity must be between 1 and 10`);
      }
      
      if (item.subtotal && (isNaN(item.subtotal) || item.subtotal < 0)) {
        errors.push(`Item ${index + 1}: Subtotal must be a positive number`);
      }
    });
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }
  
  next();
};

// Middleware to check if cart exists for user
export const checkCartExists = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const cart = await Cart.findByUser(userId);
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found for this user'
      });
    }
    
    req.cart = cart;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking cart existence',
      error: error.message
    });
  }
};

// Middleware to get or create cart for user
export const getOrCreateCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    let cart = await Cart.findByUser(userId);
    
    if (!cart) {
      // Create new cart if it doesn't exist
      cart = new Cart({
        user: userId,
        items: [],
        summary: {
          totalServices: 0,
          totalItems: 0,
          subtotal: 0,
          taxAmount: 0,
          total: 0
        }
      });
      
      await cart.save();
    }
    
    req.cart = cart;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error getting or creating cart',
      error: error.message
    });
  }
};

// Middleware to sanitize cart data
export const sanitizeCartData = (req, res, next) => {
  // Sanitize single item
  if (req.body.serviceId) {
    req.body.serviceId = req.body.serviceId.trim();
  }
  
  if (req.body.cardHeader) {
    req.body.cardHeader = req.body.cardHeader.trim();
  }
  
  if (req.body.description) {
    req.body.description = req.body.description.trim();
  }
  
  if (req.body.img) {
    req.body.img = req.body.img.trim();
  }
  
  if (req.body.duration) {
    req.body.duration = req.body.duration.trim();
  }
  
  if (req.body.category) {
    req.body.category = req.body.category.trim();
  }
  
  if (req.body.serviceType) {
    req.body.serviceType = req.body.serviceType.trim();
  }
  
  // Convert price to number if it's a string
  if (req.body.price && typeof req.body.price === 'string') {
    req.body.price = parseFloat(req.body.price);
  }
  
  // Convert quantity to number if it's a string
  if (req.body.quantity && typeof req.body.quantity === 'string') {
    req.body.quantity = parseInt(req.body.quantity);
  }
  
  // Convert subtotal to number if it's a string
  if (req.body.subtotal && typeof req.body.subtotal === 'string') {
    req.body.subtotal = parseFloat(req.body.subtotal);
  }
  
  // Sanitize items array
  if (req.body.items && Array.isArray(req.body.items)) {
    req.body.items = req.body.items.map(item => {
      const sanitizedItem = { ...item };
      
      // Trim string fields
      if (sanitizedItem.serviceId) sanitizedItem.serviceId = sanitizedItem.serviceId.trim();
      if (sanitizedItem.cardHeader) sanitizedItem.cardHeader = sanitizedItem.cardHeader.trim();
      if (sanitizedItem.description) sanitizedItem.description = sanitizedItem.description.trim();
      if (sanitizedItem.img) sanitizedItem.img = sanitizedItem.img.trim();
      if (sanitizedItem.duration) sanitizedItem.duration = sanitizedItem.duration.trim();
      if (sanitizedItem.category) sanitizedItem.category = sanitizedItem.category.trim();
      if (sanitizedItem.serviceType) sanitizedItem.serviceType = sanitizedItem.serviceType.trim();
      
      // Convert numbers
      if (sanitizedItem.price && typeof sanitizedItem.price === 'string') {
        sanitizedItem.price = parseFloat(sanitizedItem.price);
      }
      
      if (sanitizedItem.quantity && typeof sanitizedItem.quantity === 'string') {
        sanitizedItem.quantity = parseInt(sanitizedItem.quantity);
      }
      
      if (sanitizedItem.subtotal && typeof sanitizedItem.subtotal === 'string') {
        sanitizedItem.subtotal = parseFloat(sanitizedItem.subtotal);
      }
      
      return sanitizedItem;
    });
  }
  
  next();
};

// Middleware to calculate cart totals
export const calculateCartTotals = (req, res, next) => {
  if (req.body.items && Array.isArray(req.body.items)) {
    let totalServices = 0;
    let totalItems = 0;
    let subtotal = 0;
    
    req.body.items.forEach(item => {
      totalServices += 1;
      totalItems += item.quantity || 1;
      subtotal += item.subtotal || (item.price * (item.quantity || 1));
    });
    
    const taxAmount = subtotal * 0.18; // 18% GST
    const total = subtotal + taxAmount;
    
    req.calculatedTotals = {
      totalServices,
      totalItems,
      subtotal,
      taxAmount,
      total
    };
  }
  
  next();
};

// Middleware to check cart limits
export const checkCartLimits = (req, res, next) => {
  const maxItems = 20; // Maximum items in cart
  const maxQuantityPerItem = 10; // Maximum quantity per item
  
  if (req.body.items && Array.isArray(req.body.items)) {
    if (req.body.items.length > maxItems) {
      return res.status(400).json({
        success: false,
        message: `Cart cannot have more than ${maxItems} different items`
      });
    }
    
    req.body.items.forEach((item, index) => {
      if (item.quantity > maxQuantityPerItem) {
        return res.status(400).json({
          success: false,
          message: `Item ${index + 1}: Quantity cannot exceed ${maxQuantityPerItem}`
        });
      }
    });
  }
  
  next();
};

// Middleware to validate service ID format (String ID)
export const validateServiceIdFormat = (req, res, next) => {
  // Since we're using string IDs instead of MongoDB ObjectIds,
  // we just need to ensure it's a non-empty string
  if (req.body.serviceId && typeof req.body.serviceId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Service ID must be a string'
    });
  }
  
  if (req.body.serviceId && req.body.serviceId.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Service ID cannot be empty'
    });
  }
  
  next();
};
