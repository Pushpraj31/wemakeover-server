import ServiceableCity from '../models/serviceableCity.model.js';

/**
 * City Validator Utility
 * 
 * Provides city validation with caching for performance
 * Used by middleware and API endpoints
 */

// In-memory cache for serviceable cities
let cityCache = {
  data: null,
  lastUpdated: null,
  ttl: 5 * 60 * 1000 // 5 minutes cache TTL
};

/**
 * Get serviceable cities from cache or database
 * @returns {Promise<Array>} Array of serviceable city objects
 */
export const getCacheableServiceableCities = async () => {
  const now = Date.now();
  
  // Check if cache is valid
  if (cityCache.data && cityCache.lastUpdated && (now - cityCache.lastUpdated) < cityCache.ttl) {
    console.log('✅ [City Cache] Returning cached serviceable cities');
    return cityCache.data;
  }
  
  // Cache miss or expired - fetch from database
  console.log('🔄 [City Cache] Fetching fresh serviceable cities from database');
  try {
    const cities = await ServiceableCity.getActiveCities();
    
    // Update cache
    cityCache.data = cities;
    cityCache.lastUpdated = now;
    
    console.log(`✅ [City Cache] Cached ${cities.length} serviceable cities`);
    return cities;
  } catch (error) {
    console.error('❌ [City Cache] Error fetching cities:', error);
    // Return cached data even if expired, better than failing
    return cityCache.data || [];
  }
};

/**
 * Invalidate city cache (call after admin updates)
 */
export const invalidateCityCache = () => {
  console.log('🗑️ [City Cache] Cache invalidated');
  cityCache.data = null;
  cityCache.lastUpdated = null;
};

/**
 * Check if a city is serviceable
 * @param {string} cityName - City name to check
 * @returns {Promise<boolean>} True if serviceable
 */
export const isServiceableCity = async (cityName) => {
  if (!cityName || typeof cityName !== 'string') {
    return false;
  }
  
  const normalizedCity = cityName.trim().toLowerCase();
  
  // Get serviceable cities from cache
  const serviceableCities = await getCacheableServiceableCities();
  
  // Check if city exists in list (case-insensitive)
  const isServiceable = serviceableCities.some(
    city => city.city.toLowerCase() === normalizedCity
  );
  
  console.log(`🔍 [City Validation] "${cityName}" is ${isServiceable ? 'SERVICEABLE ✅' : 'NOT SERVICEABLE ❌'}`);
  
  return isServiceable;
};

/**
 * Get validation response for a city
 * @param {string} cityName - City name to validate
 * @returns {Promise<Object>} Validation response object
 */
export const getCityValidationResponse = async (cityName) => {
  const serviceableCities = await getCacheableServiceableCities();
  const isServiceable = await isServiceableCity(cityName);
  
  // Format serviceable cities for display
  const cityNames = serviceableCities.map(c => c.city);
  const displayList = cityNames.length > 2
    ? `${cityNames.slice(0, -1).join(', ')} and ${cityNames[cityNames.length - 1]}`
    : cityNames.join(' and ');
  
  return {
    isServiceable,
    requestedCity: cityName || 'Unknown',
    serviceableCities: cityNames,
    serviceableCitiesDisplay: displayList,
    message: isServiceable
      ? `Great! We provide services in ${cityName}.`
      : `We're coming to ${cityName} soon! Currently, our services are available in ${displayList} only.`,
    totalServiceableCities: cityNames.length
  };
};

/**
 * Get full city details
 * @param {string} cityName - City name
 * @returns {Promise<Object|null>} City details or null
 */
export const getCityDetails = async (cityName) => {
  if (!cityName) return null;
  
  try {
    return await ServiceableCity.getCityDetails(cityName);
  } catch (error) {
    console.error('❌ [City Validator] Error getting city details:', error);
    return null;
  }
};

/**
 * Validate city and provide detailed feedback
 * @param {string} cityName - City to validate
 * @returns {Promise<Object>} Detailed validation result
 */
export const validateCityWithDetails = async (cityName) => {
  if (!cityName) {
    return {
      valid: false,
      error: 'CITY_REQUIRED',
      message: 'City information is required',
      code: 'CITY_REQUIRED'
    };
  }
  
  const isServiceable = await isServiceableCity(cityName);
  
  if (!isServiceable) {
    const validation = await getCityValidationResponse(cityName);
    return {
      valid: false,
      error: 'CITY_NOT_SERVICEABLE',
      message: validation.message,
      code: 'CITY_NOT_SERVICEABLE',
      data: validation
    };
  }
  
  return {
    valid: true,
    message: 'City is serviceable',
    code: 'CITY_SERVICEABLE',
    city: cityName
  };
};

/**
 * Check if pincode is serviceable in a specific city
 * @param {string} cityName - City name
 * @param {string} pincode - Pincode to check
 * @returns {Promise<Object>} Validation result with details
 */
export const validateCityAndPincode = async (cityName, pincode) => {
  console.log(`🔍 [City+Pincode Validation] Checking: City="${cityName}", Pincode="${pincode}"`);
  
  // Validate inputs
  if (!cityName || !pincode) {
    return {
      valid: false,
      error: 'MISSING_DATA',
      code: 'MISSING_DATA',
      message: 'Both city and pincode are required for validation',
      isServiceable: false
    };
  }
  
  // First check if city is serviceable
  const cityDetails = await getCityDetails(cityName);
  
  if (!cityDetails) {
    console.warn(`⚠️ [City+Pincode Validation] City "${cityName}" is not serviceable`);
    const validation = await getCityValidationResponse(cityName);
    return {
      valid: false,
      error: 'CITY_NOT_SERVICEABLE',
      code: 'CITY_NOT_SERVICEABLE',
      message: validation.message,
      isServiceable: false,
      requestedCity: cityName,
      requestedPincode: pincode,
      serviceableCities: validation.serviceableCities,
      serviceableCitiesDisplay: validation.serviceableCitiesDisplay
    };
  }
  
  // City is serviceable - now check pincode
  const normalizedPincode = pincode.toString().trim();
  
  // If city has no pincode restrictions (empty array), accept all pincodes in that city
  if (!cityDetails.coveragePincodes || cityDetails.coveragePincodes.length === 0) {
    console.log(`✅ [City+Pincode Validation] City "${cityName}" has no pincode restrictions - accepting all pincodes`);
    return {
      valid: true,
      error: null,
      code: 'SERVICEABLE',
      message: `Great! We provide services in ${cityName}.`,
      isServiceable: true,
      city: cityName,
      pincode: normalizedPincode
    };
  }
  
  // Check if pincode is in the coverage list
  const isPincodeServiceable = cityDetails.coveragePincodes.includes(normalizedPincode);
  
  if (!isPincodeServiceable) {
    console.warn(`⚠️ [City+Pincode Validation] Pincode "${normalizedPincode}" not serviceable in "${cityName}"`);
    return {
      valid: false,
      error: 'PINCODE_NOT_SERVICEABLE',
      code: 'PINCODE_NOT_SERVICEABLE',
      message: `We're expanding in ${cityName}! Currently, we don't cover pincode ${normalizedPincode}. We serve pincodes: ${cityDetails.coveragePincodes.slice(0, 5).join(', ')}${cityDetails.coveragePincodes.length > 5 ? ` and ${cityDetails.coveragePincodes.length - 5} more` : ''}.`,
      isServiceable: false,
      requestedCity: cityName,
      requestedPincode: normalizedPincode,
      serviceablePincodes: cityDetails.coveragePincodes,
      totalServiceablePincodes: cityDetails.coveragePincodes.length
    };
  }
  
  console.log(`✅ [City+Pincode Validation] City "${cityName}" and Pincode "${normalizedPincode}" are both serviceable`);
  return {
    valid: true,
    error: null,
    code: 'SERVICEABLE',
    message: `Great! We provide services in ${cityName} at pincode ${normalizedPincode}.`,
    isServiceable: true,
    city: cityName,
    pincode: normalizedPincode
  };
};

/**
 * Check if pincode is serviceable (legacy - checks across all cities)
 * @param {string} pincode - Pincode to check
 * @returns {Promise<boolean>} True if serviceable
 */
export const isServiceablePincode = async (pincode) => {
  if (!pincode) return false;
  
  try {
    const serviceableCities = await getCacheableServiceableCities();
    
    const normalizedPincode = pincode.toString().trim();
    
    // Check if any city covers this pincode
    const covered = serviceableCities.some(city => 
      city.coveragePincodes && city.coveragePincodes.includes(normalizedPincode)
    );
    
    return covered;
  } catch (error) {
    console.error('❌ [Pincode Validation] Error:', error);
    return false;
  }
};

/**
 * Increment booking count for a city
 * @param {string} cityName - City name
 */
export const incrementCityBookingCount = async (cityName) => {
  if (!cityName) return;
  
  try {
    await ServiceableCity.incrementBookingCount(cityName);
    console.log(`📊 [City Analytics] Incremented booking count for ${cityName}`);
  } catch (error) {
    console.error('❌ [City Analytics] Error incrementing booking count:', error);
  }
};

export default {
  getCacheableServiceableCities,
  invalidateCityCache,
  isServiceableCity,
  getCityValidationResponse,
  getCityDetails,
  validateCityWithDetails,
  validateCityAndPincode,
  isServiceablePincode,
  incrementCityBookingCount
};



