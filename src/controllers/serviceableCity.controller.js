import {
  getCacheableServiceableCities,
  getCityValidationResponse,
  validateCityAndPincode
} from '../utils/cityValidator.js';

/**
 * ServiceableCity Controller
 * 
 * Handles public-facing city serviceability endpoints
 */

/**
 * @route   GET /api/bookings/serviceable-cities
 * @desc    Get list of all active serviceable cities
 * @access  Public
 */
export const getServiceableCities = async (req, res) => {
  try {
    console.log('📍 [Serviceable Cities API] Fetching serviceable cities list');
    
    // Get cities from cache or database
    const cities = await getCacheableServiceableCities();
    
    // Format response for frontend
    const formattedCities = cities.map(city => ({
      city: city.city,
      state: city.state,
      displayName: city.displayName || `${city.city}, ${city.state}`,
      priority: city.priority || 0
    }));
    
    console.log(`✅ [Serviceable Cities API] Returning ${formattedCities.length} cities`);
    
    res.status(200).json({
      success: true,
      data: formattedCities,
      count: formattedCities.length,
      message: `We currently serve ${formattedCities.length} ${formattedCities.length === 1 ? 'city' : 'cities'}`
    });
  } catch (error) {
    console.error('❌ [Serviceable Cities API] Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch serviceable cities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   POST /api/bookings/check-serviceability
 * @desc    Check if a specific city is serviceable
 * @access  Public
 * @body    { city: string }
 */
export const checkCityServiceability = async (req, res) => {
  try {
    const { city } = req.body;
    
    console.log('🔍 [City Serviceability Check] Request received for city:', city);
    
    // Validate input
    if (!city || typeof city !== 'string' || city.trim() === '') {
      console.warn('⚠️ [City Serviceability Check] Invalid or missing city');
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid city name',
        code: 'INVALID_CITY'
      });
    }
    
    // Get validation response
    const validation = await getCityValidationResponse(city);
    
    console.log(`✅ [City Serviceability Check] Result for "${city}": ${validation.isServiceable ? 'SERVICEABLE' : 'NOT SERVICEABLE'}`);
    
    // Return validation result
    res.status(200).json({
      success: true,
      data: validation,
      message: validation.message
    });
  } catch (error) {
    console.error('❌ [City Serviceability Check] Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to check city serviceability',
      code: 'SERVICEABILITY_CHECK_FAILED',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   POST /api/bookings/check-location-serviceability
 * @desc    Check if both city and pincode are serviceable
 * @access  Public
 * @body    { city: string, pincode: string }
 */
export const checkLocationServiceability = async (req, res) => {
  try {
    const { city, pincode } = req.body;
    
    console.log('🔍 [Location Serviceability Check] Request received:', { city, pincode });
    
    // Validate inputs
    if (!city || typeof city !== 'string' || city.trim() === '') {
      console.warn('⚠️ [Location Serviceability Check] Invalid or missing city');
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid city name',
        code: 'INVALID_CITY'
      });
    }
    
    if (!pincode || typeof pincode !== 'string' || pincode.trim() === '') {
      console.warn('⚠️ [Location Serviceability Check] Invalid or missing pincode');
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid pincode',
        code: 'INVALID_PINCODE'
      });
    }
    
    // Get validation response
    const validation = await validateCityAndPincode(city, pincode);
    
    console.log(`✅ [Location Serviceability Check] Result for "${city}" (${pincode}): ${validation.isServiceable ? 'SERVICEABLE' : 'NOT SERVICEABLE'}`);
    
    // Return validation result
    res.status(200).json({
      success: true,
      data: validation,
      message: validation.message
    });
  } catch (error) {
    console.error('❌ [Location Serviceability Check] Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to check location serviceability',
      code: 'SERVICEABILITY_CHECK_FAILED',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  getServiceableCities,
  checkCityServiceability,
  checkLocationServiceability
};



