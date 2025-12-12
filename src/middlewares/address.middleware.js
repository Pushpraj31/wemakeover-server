import mongoose from 'mongoose';
import Address from '../models/address.model.js';

// Validation regex patterns
const pincodeRegex = /^[1-9][0-9]{5}$/; // 6-digit pincode starting with 1-9

// Validate address creation
export const validateAddressCreation = (req, res, next) => {
  const errors = [];
  
  const requiredFields = [
    'houseFlatNumber', 
    'streetAreaName', 
    'completeAddress', 
    'pincode'
  ];
  
  // Check required fields
  requiredFields.forEach(field => {
    if (!req.body[field] || req.body[field].trim() === '') {
      errors.push(`${field} is required`);
    }
  });
  
  // Validate field lengths
  if (req.body.houseFlatNumber && req.body.houseFlatNumber.length > 50) {
    errors.push('House/Flat number cannot exceed 50 characters');
  }
  
  if (req.body.streetAreaName && req.body.streetAreaName.length > 100) {
    errors.push('Street/Area name cannot exceed 100 characters');
  }
  
  if (req.body.completeAddress && req.body.completeAddress.length > 200) {
    errors.push('Complete address cannot exceed 200 characters');
  }
  
  if (req.body.landmark && req.body.landmark.length > 100) {
    errors.push('Landmark cannot exceed 100 characters');
  }
  
  if (req.body.city && req.body.city.length > 50) {
    errors.push('City name cannot exceed 50 characters');
  }
  
  if (req.body.state && req.body.state.length > 50) {
    errors.push('State name cannot exceed 50 characters');
  }
  
  // Validate pincode format
  if (req.body.pincode && !pincodeRegex.test(req.body.pincode)) {
    errors.push('Please provide a valid 6-digit pincode');
  }
  
  // Validate address type if provided
  if (req.body.addressType && !['home', 'office', 'other'].includes(req.body.addressType)) {
    errors.push('Address type must be one of: home, office, other');
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

// Validate address update
export const validateAddressUpdate = (req, res, next) => {
  const errors = [];
  
  // Check if at least one field is being updated
  const allowedFields = [
    'houseFlatNumber', 
    'streetAreaName', 
    'completeAddress', 
    'landmark',
    'pincode', 
    'city', 
    'state', 
    'country',
    'addressType',
    'isDefault'
  ];
  
  const hasValidField = allowedFields.some(field => req.body.hasOwnProperty(field));
  
  if (!hasValidField) {
    errors.push('At least one valid field must be provided for update');
  }
  
  // Validate field lengths (only if provided)
  if (req.body.houseFlatNumber && req.body.houseFlatNumber.length > 50) {
    errors.push('House/Flat number cannot exceed 50 characters');
  }
  
  if (req.body.streetAreaName && req.body.streetAreaName.length > 100) {
    errors.push('Street/Area name cannot exceed 100 characters');
  }
  
  if (req.body.completeAddress && req.body.completeAddress.length > 200) {
    errors.push('Complete address cannot exceed 200 characters');
  }
  
  if (req.body.landmark && req.body.landmark.length > 100) {
    errors.push('Landmark cannot exceed 100 characters');
  }
  
  if (req.body.city && req.body.city.length > 50) {
    errors.push('City name cannot exceed 50 characters');
  }
  
  if (req.body.state && req.body.state.length > 50) {
    errors.push('State name cannot exceed 50 characters');
  }
  
  // Validate pincode format (only if provided)
  if (req.body.pincode && !pincodeRegex.test(req.body.pincode)) {
    errors.push('Please provide a valid 6-digit pincode');
  }
  
  // Validate address type if provided
  if (req.body.addressType && !['home', 'office', 'other'].includes(req.body.addressType)) {
    errors.push('Address type must be one of: home, office, other');
  }
  
  // Validate isDefault (should be boolean)
  if (req.body.hasOwnProperty('isDefault') && typeof req.body.isDefault !== 'boolean') {
    errors.push('isDefault must be a boolean value');
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

// Sanitize address data
export const sanitizeAddressData = (req, res, next) => {
  // Sanitize string fields
  const stringFields = [
    'houseFlatNumber',
    'streetAreaName', 
    'completeAddress',
    'landmark',
    'pincode',
    'city',
    'state',
    'country'
  ];
  
  stringFields.forEach(field => {
    if (req.body[field]) {
      req.body[field] = req.body[field].toString().trim();
    }
  });
  
  // Convert pincode to string if it's a number
  if (req.body.pincode) {
    req.body.pincode = req.body.pincode.toString().trim();
  }
  
  // Sanitize boolean fields
  if (req.body.hasOwnProperty('isDefault')) {
    req.body.isDefault = Boolean(req.body.isDefault);
  }
  
  if (req.body.hasOwnProperty('isActive')) {
    req.body.isActive = Boolean(req.body.isActive);
  }
  
  // Set default values for optional fields
  if (!req.body.state) {
    req.body.state = 'Bihar';
  }
  
  if (!req.body.country) {
    req.body.country = 'India';
  }
  
  if (!req.body.addressType) {
    req.body.addressType = 'home';
  }
  
  next();
};

// Check if address exists and belongs to user
export const checkAddressOwnership = async (req, res, next) => {
  try {
    const addressId = req.params.id;
    const userId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address ID format'
      });
    }
    
    const address = await Address.findOne({
      _id: addressId,
      user: userId,
      isActive: true
    });
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found or does not belong to you'
      });
    }
    
    // Attach address to request for use in controller
    req.address = address;
    next();
  } catch (error) {
    console.error('Address ownership check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking address ownership',
      error: error.message
    });
  }
};

// Check if user has reached maximum address limit
export const checkAddressLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const maxAddresses = 10; // Maximum addresses per user
    
    const addressCount = await Address.countDocuments({
      user: userId,
      isActive: true
    });
    
    if (addressCount >= maxAddresses) {
      return res.status(400).json({
        success: false,
        message: `Maximum address limit reached. You can have up to ${maxAddresses} addresses.`
      });
    }
    
    next();
  } catch (error) {
    console.error('Address limit check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking address limit',
      error: error.message
    });
  }
};

// Validate address ID format
export const validateAddressId = (req, res, next) => {
  const addressId = req.params.id;
  
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid address ID format'
    });
  }
  
  next();
};

// Middleware to check if user has any addresses
export const checkUserHasAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const addressCount = await Address.countDocuments({
      user: userId,
      isActive: true
    });
    
    if (addressCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No addresses found for this user'
      });
    }
    
    next();
  } catch (error) {
    console.error('User address check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking user addresses',
      error: error.message
    });
  }
};

// Middleware to validate default address logic
export const validateDefaultAddressLogic = async (req, res, next) => {
  try {
    // Only validate if isDefault is being set to true
    if (req.body.isDefault === true) {
      const userId = req.user.id;
      const addressId = req.params.id; // For updates
      
      // Check if user already has a default address
      const existingDefault = await Address.findOne({
        user: userId,
        isDefault: true,
        isActive: true,
        ...(addressId && { _id: { $ne: addressId } }) // Exclude current address for updates
      });
      
      // This will be handled by the model's pre-save middleware
      // We just need to ensure the request is valid
      if (existingDefault && !addressId) {
        // For new address creation, warn user but allow it (model will handle)
        console.log(`User ${userId} is setting a new default address. Previous default will be unset.`);
      }
    }
    
    next();
  } catch (error) {
    console.error('Default address validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating default address logic',
      error: error.message
    });
  }
};




