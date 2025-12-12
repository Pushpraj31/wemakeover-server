import Service from '../models/service.model.js';

// Validation middleware for service creation
export const validateServiceCreation = (req, res, next) => {
  const errors = [];
  
  // Required fields validation
  const requiredFields = ['name', 'description', 'price', 'image', 'category'];
  requiredFields.forEach(field => {
    if (!req.body[field]) {
      errors.push(`${field} is required`);
    }
  });
  
  // Data type validation
  if (req.body.price && (isNaN(req.body.price) || req.body.price < 0)) {
    errors.push('Price must be a positive number');
  }
  
  
  if (req.body.name && typeof req.body.name !== 'string') {
    errors.push('Service name must be a string');
  }
  
  if (req.body.description && typeof req.body.description !== 'string') {
    errors.push('Description must be a string');
  }
  
  // String length validation
  if (req.body.name && req.body.name.length > 100) {
    errors.push('Service name cannot exceed 100 characters');
  }
  
  if (req.body.description && req.body.description.length > 500) {
    errors.push('Description cannot exceed 500 characters');
  }
  
  // Category validation
  const validCategories = ['Regular', 'Premium', 'Bridal', 'Classic'];
  if (req.body.category && !validCategories.includes(req.body.category)) {
    errors.push('Category must be one of: Regular, Premium, Bridal, Classic');
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
  
  if (req.body.isActive !== undefined && typeof req.body.isActive !== 'boolean') {
    errors.push('isActive must be a boolean value');
  }
  
  if (req.body.isAvailable !== undefined && typeof req.body.isAvailable !== 'boolean') {
    errors.push('isAvailable must be a boolean value');
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

// Validation middleware for service update
export const validateServiceUpdate = (req, res, next) => {
  const errors = [];
  
  // Data type validation for provided fields
  if (req.body.price !== undefined && (isNaN(req.body.price) || req.body.price < 0)) {
    errors.push('Price must be a positive number');
  }
  
  if (req.body.name !== undefined && typeof req.body.name !== 'string') {
    errors.push('Service name must be a string');
  }
  
  if (req.body.description !== undefined && typeof req.body.description !== 'string') {
    errors.push('Description must be a string');
  }
  
  // String length validation
  if (req.body.name && req.body.name.length > 100) {
    errors.push('Service name cannot exceed 100 characters');
  }
  
  if (req.body.description && req.body.description.length > 500) {
    errors.push('Description cannot exceed 500 characters');
  }
  
  // Category validation
  const validCategories = ['Regular', 'Premium', 'Bridal', 'Classic'];
  if (req.body.category && !validCategories.includes(req.body.category)) {
    errors.push('Category must be one of: Regular, Premium, Bridal, Classic');
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
  
  if (req.body.isActive !== undefined && typeof req.body.isActive !== 'boolean') {
    errors.push('isActive must be a boolean value');
  }
  
  if (req.body.isAvailable !== undefined && typeof req.body.isAvailable !== 'boolean') {
    errors.push('isAvailable must be a boolean value');
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

// Middleware to check if service exists
export const checkServiceExists = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    
    const service = await Service.findById(serviceId);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    req.service = service;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking service existence',
      error: error.message
    });
  }
};


// Middleware to sanitize service data
export const sanitizeServiceData = (req, res, next) => {
  // Trim string fields
  if (req.body.name) req.body.name = req.body.name.trim();
  if (req.body.description) req.body.description = req.body.description.trim();
  if (req.body.duration) req.body.duration = req.body.duration.trim();
  if (req.body.image) req.body.image = req.body.image.trim();
  if (req.body.category) req.body.category = req.body.category.trim();
  if (req.body.serviceType) req.body.serviceType = req.body.serviceType.trim();
  
  // Convert price to number if it's a string
  if (req.body.price && typeof req.body.price === 'string') {
    req.body.price = parseFloat(req.body.price);
  }
  
  // Trim tags array
  if (req.body.tags && Array.isArray(req.body.tags)) {
    req.body.tags = req.body.tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
  }
  
  next();
};

// Middleware for pagination
export const paginateServices = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  req.pagination = {
    page,
    limit,
    skip
  };
  
  next();
};

// Middleware for filtering
export const filterServices = (req, res, next) => {
  const filters = {};
  
  // Category filter
  if (req.query.category) {
    filters.category = req.query.category;
  }
  
  // Price range filter
  if (req.query.minPrice) {
    filters.price = { ...filters.price, $gte: parseFloat(req.query.minPrice) };
  }
  
  if (req.query.maxPrice) {
    filters.price = { ...filters.price, $lte: parseFloat(req.query.maxPrice) };
  }
  
  // Active filter
  if (req.query.isActive !== undefined) {
    filters.isActive = req.query.isActive === 'true';
  }
  
  // Available filter
  if (req.query.isAvailable !== undefined) {
    filters.isAvailable = req.query.isAvailable === 'true';
  }
  
  // Search filter
  if (req.query.search) {
    filters.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  req.filters = filters;
  next();
};
