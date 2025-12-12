import BookingConfigService from '../services/bookingConfig.service.js';

/**
 * Get all active booking configs
 * @route GET /api/admin/booking-config
 * @access Private (Admin only)
 */
export const getAllActiveConfigs = async (req, res) => {
  try {
    const result = await BookingConfigService.getAllActiveConfigs();
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getAllActiveConfigs controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get all configs (including inactive) - Admin only
 * @route GET /api/admin/booking-config/all
 * @access Private (Admin only)
 */
export const getAllConfigs = async (req, res) => {
  try {
    const result = await BookingConfigService.getAllConfigs();
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getAllConfigs controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get specific config by key
 * @route GET /api/admin/booking-config/:configKey
 * @access Private (Admin only)
 */
export const getConfigByKey = async (req, res) => {
  try {
    const { configKey } = req.params;
    
    if (!configKey) {
      return res.status(400).json({
        success: false,
        message: 'Config key is required'
      });
    }
    
    const result = await BookingConfigService.getConfigByKey(configKey);
    
    if (!result.success) {
      const statusCode = result.error === 'CONFIG_NOT_FOUND' ? 404 : 400;
      return res.status(statusCode).json(result);
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getConfigByKey controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Create new booking config
 * @route POST /api/admin/booking-config
 * @access Private (Admin only)
 */
export const createConfig = async (req, res) => {
  try {
    const adminId = req.user.id;
    const configData = req.body;
    
    // Validate required fields
    if (!configData.configKey || !configData.value || !configData.description) {
      return res.status(400).json({
        success: false,
        message: 'Config key, value, and description are required'
      });
    }
    
    const result = await BookingConfigService.createConfig(configData, adminId);
    
    if (!result.success) {
      const statusCode = result.error === 'CONFIG_ALREADY_EXISTS' ? 409 : 400;
      return res.status(statusCode).json(result);
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in createConfig controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Update config value
 * @route PUT /api/admin/booking-config/:configKey
 * @access Private (Admin only)
 */
export const updateConfigValue = async (req, res) => {
  try {
    const { configKey } = req.params;
    const { value, reason } = req.body;
    const adminId = req.user.id;
    
    if (!configKey) {
      return res.status(400).json({
        success: false,
        message: 'Config key is required'
      });
    }
    
    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: 'Value is required'
      });
    }
    
    const result = await BookingConfigService.updateConfigValue(
      configKey,
      value,
      adminId,
      reason
    );
    
    if (!result.success) {
      const statusCode = result.error === 'CONFIG_NOT_FOUND' ? 404 : 400;
      return res.status(statusCode).json(result);
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in updateConfigValue controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Toggle config active status
 * @route PATCH /api/admin/booking-config/:configKey/toggle
 * @access Private (Admin only)
 */
export const toggleConfigStatus = async (req, res) => {
  try {
    const { configKey } = req.params;
    const adminId = req.user.id;
    
    if (!configKey) {
      return res.status(400).json({
        success: false,
        message: 'Config key is required'
      });
    }
    
    const result = await BookingConfigService.toggleConfigStatus(configKey, adminId);
    
    if (!result.success) {
      const statusCode = result.error === 'CONFIG_NOT_FOUND' ? 404 : 400;
      return res.status(statusCode).json(result);
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in toggleConfigStatus controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Delete config
 * @route DELETE /api/admin/booking-config/:configKey
 * @access Private (Admin only)
 */
export const deleteConfig = async (req, res) => {
  try {
    const { configKey } = req.params;
    const adminId = req.user.id;
    
    if (!configKey) {
      return res.status(400).json({
        success: false,
        message: 'Config key is required'
      });
    }
    
    const result = await BookingConfigService.deleteConfig(configKey, adminId);
    
    if (!result.success) {
      const statusCode = result.error === 'CONFIG_NOT_FOUND' ? 404 : 
                        result.error === 'CRITICAL_CONFIG' ? 403 : 400;
      return res.status(statusCode).json(result);
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in deleteConfig controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Seed initial configs
 * @route POST /api/admin/booking-config/seed
 * @access Private (Admin only)
 */
export const seedInitialConfigs = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    console.log(`🌱 Admin ${adminId} initiating config seeding...`);
    
    const result = await BookingConfigService.seedInitialConfigs(adminId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in seedInitialConfigs controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get config audit log
 * @route GET /api/admin/booking-config/:configKey/audit-log
 * @access Private (Admin only)
 */
export const getConfigAuditLog = async (req, res) => {
  try {
    const { configKey } = req.params;
    
    if (!configKey) {
      return res.status(400).json({
        success: false,
        message: 'Config key is required'
      });
    }
    
    const result = await BookingConfigService.getConfigAuditLog(configKey);
    
    if (!result.success) {
      const statusCode = result.error === 'CONFIG_NOT_FOUND' ? 404 : 400;
      return res.status(statusCode).json(result);
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getConfigAuditLog controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

