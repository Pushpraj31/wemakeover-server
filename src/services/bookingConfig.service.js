import BookingConfig from '../models/bookingConfig.model.js';
import { getCache, setCache, deleteCache } from '../uitils/redis/redis.utils.js';

/**
 * BookingConfig Service
 * 
 * Handles all business logic for booking configuration management.
 * Implements caching strategy for performance optimization.
 */
class BookingConfigService {
  /**
   * Get config by key with caching
   * @param {String} configKey - Config key to fetch
   * @returns {Object} Config object or null
   */
  async getConfigByKey(configKey) {
    try {
      const cacheKey = `booking:config:${configKey.toUpperCase()}`;
      
      // Try to get from cache first
      const cachedConfig = await getCache(cacheKey);
      if (cachedConfig) {
        console.log(`✅ Cache hit for config: ${configKey}`);
        return {
          success: true,
          data: cachedConfig,
          source: 'cache'
        };
      }
      
      // Cache miss - fetch from database
      console.log(`⚠️ Cache miss for config: ${configKey}, fetching from DB`);
      const config = await BookingConfig.getByKey(configKey);
      
      if (!config) {
        return {
          success: false,
          message: `Config ${configKey} not found or inactive`,
          error: 'CONFIG_NOT_FOUND'
        };
      }
      
      // Store in cache with 1 hour TTL
      await setCache(cacheKey, config, 3600);
      
      return {
        success: true,
        data: config,
        source: 'database'
      };
    } catch (error) {
      console.error('Error fetching config:', error);
      return {
        success: false,
        message: 'Failed to fetch config',
        error: error.message
      };
    }
  }

  /**
   * Get all active configs
   * @returns {Object} Array of active configs
   */
  async getAllActiveConfigs() {
    try {
      const configs = await BookingConfig.getAllActive();
      
      return {
        success: true,
        data: configs,
        count: configs.length,
        message: 'Active configs retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching all configs:', error);
      return {
        success: false,
        message: 'Failed to fetch configs',
        error: error.message
      };
    }
  }

  /**
   * Get all configs (including inactive) - Admin only
   * @returns {Object} Array of all configs
   */
  async getAllConfigs() {
    try {
      const configs = await BookingConfig.find()
        .populate('lastUpdatedBy', 'name email')
        .sort({ configKey: 1 });
      
      return {
        success: true,
        data: configs,
        count: configs.length,
        message: 'All configs retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching all configs:', error);
      return {
        success: false,
        message: 'Failed to fetch configs',
        error: error.message
      };
    }
  }

  /**
   * Create new config - Admin only
   * @param {Object} configData - Config data
   * @param {String} adminId - Admin user ID
   * @returns {Object} Created config
   */
  async createConfig(configData, adminId) {
    try {
      // Check if config already exists
      const existing = await BookingConfig.findOne({ 
        configKey: configData.configKey.toUpperCase() 
      });
      
      if (existing) {
        return {
          success: false,
          message: `Config ${configData.configKey} already exists`,
          error: 'CONFIG_ALREADY_EXISTS',
          data: existing
        };
      }
      
      // Create new config
      const config = await BookingConfig.create({
        ...configData,
        configKey: configData.configKey.toUpperCase(),
        lastUpdatedBy: adminId
      });
      
      // Clear cache for this config
      const cacheKey = `booking:config:${config.configKey}`;
      await deleteCache(cacheKey);
      
      console.log(`✅ Config created: ${config.configKey} = ${config.value}`);
      
      return {
        success: true,
        data: config,
        message: `Config ${config.configKey} created successfully`
      };
    } catch (error) {
      console.error('Error creating config:', error);
      
      if (error.code === 11000) {
        return {
          success: false,
          message: 'Config with this key already exists',
          error: 'DUPLICATE_CONFIG_KEY'
        };
      }
      
      return {
        success: false,
        message: 'Failed to create config',
        error: error.message
      };
    }
  }

  /**
   * Update config value - Admin only
   * @param {String} configKey - Config key to update
   * @param {Number} newValue - New value
   * @param {String} adminId - Admin user ID
   * @param {String} reason - Reason for update (optional)
   * @returns {Object} Updated config
   */
  async updateConfigValue(configKey, newValue, adminId, reason = null) {
    try {
      const config = await BookingConfig.findOne({ 
        configKey: configKey.toUpperCase() 
      });
      
      if (!config) {
        return {
          success: false,
          message: `Config ${configKey} not found`,
          error: 'CONFIG_NOT_FOUND'
        };
      }
      
      // Validate new value
      if (typeof newValue !== 'number' || newValue < 0) {
        return {
          success: false,
          message: 'Config value must be a non-negative number',
          error: 'INVALID_VALUE'
        };
      }
      
      // Validate against metadata rules if present
      if (config.metadata?.validationRules) {
        const { min, max } = config.metadata.validationRules;
        
        if (min !== undefined && newValue < min) {
          return {
            success: false,
            message: `Value must be at least ${min}`,
            error: 'VALUE_TOO_LOW'
          };
        }
        
        if (max !== undefined && newValue > max) {
          return {
            success: false,
            message: `Value cannot exceed ${max}`,
            error: 'VALUE_TOO_HIGH'
          };
        }
      }
      
      const previousValue = config.value;
      
      // Update config using instance method
      await config.updateValue(newValue, adminId, reason);
      
      // Clear cache for this config
      const cacheKey = `booking:config:${config.configKey}`;
      await deleteCache(cacheKey);
      
      console.log(`✅ Config updated: ${config.configKey} from ${previousValue} to ${newValue} by admin ${adminId}`);
      
      return {
        success: true,
        data: config,
        message: `Config ${config.configKey} updated successfully`,
        previousValue,
        newValue
      };
    } catch (error) {
      console.error('Error updating config:', error);
      return {
        success: false,
        message: 'Failed to update config',
        error: error.message
      };
    }
  }

  /**
   * Toggle config active status - Admin only
   * @param {String} configKey - Config key to toggle
   * @param {String} adminId - Admin user ID
   * @returns {Object} Updated config
   */
  async toggleConfigStatus(configKey, adminId) {
    try {
      const config = await BookingConfig.findOne({ 
        configKey: configKey.toUpperCase() 
      });
      
      if (!config) {
        return {
          success: false,
          message: `Config ${configKey} not found`,
          error: 'CONFIG_NOT_FOUND'
        };
      }
      
      const previousStatus = config.isActive;
      
      // Toggle status using instance method
      await config.toggleActive(adminId);
      
      // Clear cache for this config
      const cacheKey = `booking:config:${config.configKey}`;
      await deleteCache(cacheKey);
      
      console.log(`✅ Config status toggled: ${config.configKey} from ${previousStatus} to ${config.isActive}`);
      
      return {
        success: true,
        data: config,
        message: `Config ${config.configKey} ${config.isActive ? 'activated' : 'deactivated'} successfully`,
        previousStatus,
        newStatus: config.isActive
      };
    } catch (error) {
      console.error('Error toggling config status:', error);
      return {
        success: false,
        message: 'Failed to toggle config status',
        error: error.message
      };
    }
  }

  /**
   * Delete config - Admin only (use with caution)
   * @param {String} configKey - Config key to delete
   * @param {String} adminId - Admin user ID
   * @returns {Object} Deletion result
   */
  async deleteConfig(configKey, adminId) {
    try {
      const config = await BookingConfig.findOne({ 
        configKey: configKey.toUpperCase() 
      });
      
      if (!config) {
        return {
          success: false,
          message: `Config ${configKey} not found`,
          error: 'CONFIG_NOT_FOUND'
        };
      }
      
      // Prevent deletion of critical configs
      const criticalConfigs = ['MINIMUM_ORDER_VALUE', 'CANCELLATION_WINDOW_HOURS', 'RESCHEDULE_WINDOW_HOURS'];
      if (criticalConfigs.includes(config.configKey)) {
        return {
          success: false,
          message: `Cannot delete critical config ${config.configKey}. Consider deactivating it instead.`,
          error: 'CRITICAL_CONFIG'
        };
      }
      
      await BookingConfig.deleteOne({ _id: config._id });
      
      // Clear cache for this config
      const cacheKey = `booking:config:${config.configKey}`;
      await deleteCache(cacheKey);
      
      console.log(`✅ Config deleted: ${config.configKey} by admin ${adminId}`);
      
      return {
        success: true,
        message: `Config ${config.configKey} deleted successfully`,
        deletedConfig: config
      };
    } catch (error) {
      console.error('Error deleting config:', error);
      return {
        success: false,
        message: 'Failed to delete config',
        error: error.message
      };
    }
  }

  /**
   * Seed initial configs - Admin only
   * @param {String} adminId - Admin user ID
   * @returns {Object} Seeding results
   */
  async seedInitialConfigs(adminId) {
    try {
      console.log('🌱 Seeding initial booking configs...');
      
      const results = await BookingConfig.seedInitialConfigs(adminId);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      console.log(`✅ Seeding complete: ${successCount} created, ${failureCount} skipped`);
      
      return {
        success: true,
        data: results,
        summary: {
          total: results.length,
          created: successCount,
          skipped: failureCount
        },
        message: `Seeding complete: ${successCount} configs created, ${failureCount} already existed`
      };
    } catch (error) {
      console.error('Error seeding configs:', error);
      return {
        success: false,
        message: 'Failed to seed configs',
        error: error.message
      };
    }
  }

  /**
   * Get config audit log - Admin only
   * @param {String} configKey - Config key
   * @returns {Object} Audit log entries
   */
  async getConfigAuditLog(configKey) {
    try {
      const config = await BookingConfig.findOne({ 
        configKey: configKey.toUpperCase() 
      }).populate('auditLog.updatedBy', 'name email');
      
      if (!config) {
        return {
          success: false,
          message: `Config ${configKey} not found`,
          error: 'CONFIG_NOT_FOUND'
        };
      }
      
      return {
        success: true,
        data: {
          configKey: config.configKey,
          currentValue: config.value,
          auditLog: config.auditLog
        },
        message: 'Audit log retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching audit log:', error);
      return {
        success: false,
        message: 'Failed to fetch audit log',
        error: error.message
      };
    }
  }
}

export default new BookingConfigService();

