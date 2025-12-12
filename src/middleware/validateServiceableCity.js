import { validateCityWithDetails, getCityValidationResponse, validateCityAndPincode } from '../utils/cityValidator.js';

/**
 * Middleware to validate if booking city AND pincode are serviceable
 * 
 * Checks both city and pincode from booking/address data and blocks
 * bookings for non-serviceable locations
 * 
 * Usage: Apply to booking routes before processing payment/order
 */
export const validateServiceableCity = async (req, res, next) => {
  try {
    console.log('🔍 [City+Pincode Validation Middleware] Validating booking location...');
    
    const { booking, bookingDetails, address } = req.body;
    
    // Extract city and pincode from different possible locations in request
    const city = 
      booking?.address?.city ||
      bookingDetails?.address?.city ||
      address?.city ||
      null;
    
    const pincode = 
      booking?.address?.pincode ||
      bookingDetails?.address?.pincode ||
      address?.pincode ||
      null;
    
    console.log('📍 [City+Pincode Validation Middleware] Extracted:', { city, pincode });
    
    // Validate city existence
    if (!city) {
      console.error('❌ [City+Pincode Validation Middleware] No city provided in request');
      return res.status(400).json({
        success: false,
        message: 'City information is required for booking. Please select or add a valid address.',
        code: 'CITY_REQUIRED',
        error: 'CITY_REQUIRED'
      });
    }
    
    // Validate pincode existence
    if (!pincode) {
      console.error('❌ [City+Pincode Validation Middleware] No pincode provided in request');
      return res.status(400).json({
        success: false,
        message: 'Pincode is required for booking. Please select or add a valid address with pincode.',
        code: 'PINCODE_REQUIRED',
        error: 'PINCODE_REQUIRED'
      });
    }
    
    // Validate both city and pincode serviceability
    const validation = await validateCityAndPincode(city, pincode);
    
    if (!validation.valid) {
      console.warn(`⚠️ [City+Pincode Validation Middleware] Booking blocked - City: ${city}, Pincode: ${pincode}, Reason: ${validation.code}`);
      
      return res.status(400).json({
        success: false,
        code: validation.code,
        error: validation.error,
        message: validation.message,
        data: {
          requestedCity: validation.requestedCity || city,
          requestedPincode: validation.requestedPincode || pincode,
          isServiceable: false,
          // Include serviceable cities if city is not serviceable
          ...(validation.serviceableCities && {
            serviceableCities: validation.serviceableCities,
            serviceableCitiesDisplay: validation.serviceableCitiesDisplay,
            totalServiceableCities: validation.serviceableCities.length
          }),
          // Include serviceable pincodes if pincode is not serviceable
          ...(validation.serviceablePincodes && {
            serviceablePincodes: validation.serviceablePincodes,
            totalServiceablePincodes: validation.totalServiceablePincodes
          })
        }
      });
    }
    
    // Both city and pincode are serviceable - attach to request for later use
    req.serviceableCity = city;
    req.serviceablePincode = pincode;
    req.locationValidation = validation;
    
    console.log(`✅ [City+Pincode Validation Middleware] Location validated successfully - City: "${city}", Pincode: "${pincode}"`);
    
    next();
  } catch (error) {
    console.error('❌ [City+Pincode Validation Middleware] Unexpected error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to validate service availability. Please try again.',
      code: 'VALIDATION_ERROR',
      error: 'VALIDATION_ERROR'
    });
  }
};

/**
 * Optional: Soft validation middleware (warning only, doesn't block)
 * Useful for address creation where we want to allow any city
 * but provide feedback about serviceability
 */
export const softValidateServiceableCity = async (req, res, next) => {
  try {
    const { city } = req.body;
    
    if (city) {
      const validation = await getCityValidationResponse(city);
      
      // Attach validation info to request (don't block)
      req.cityServiceability = validation;
      
      if (!validation.isServiceable) {
        console.log(`ℹ️ [Soft Validation] Non-serviceable city detected: ${city} (not blocking)`);
      }
    }
    
    next();
  } catch (error) {
    console.error('❌ [Soft Validation Middleware] Error:', error);
    // Don't block on error in soft validation
    next();
  }
};

export default { validateServiceableCity, softValidateServiceableCity };



