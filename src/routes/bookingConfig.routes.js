import express from 'express';
import {
  getAllActiveConfigs,
  getAllConfigs,
  getConfigByKey,
  createConfig,
  updateConfigValue,
  toggleConfigStatus,
  deleteConfig,
  seedInitialConfigs,
  getConfigAuditLog
} from '../controllers/bookingConfig.controller.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ============================================
// ADMIN ROUTES (require authentication + admin role)
// ============================================

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @route   POST /api/admin/booking-config/seed
 * @desc    Seed initial booking configs (MINIMUM_ORDER_VALUE, etc.)
 * @access  Private (Admin only)
 * @body    None required
 * @response Array of seeding results with summary
 */
router.post('/seed', seedInitialConfigs);

/**
 * @route   GET /api/admin/booking-config
 * @desc    Get all active booking configs
 * @access  Private (Admin only)
 * @response Array of active configs
 */
router.get('/', getAllActiveConfigs);

/**
 * @route   GET /api/admin/booking-config/all
 * @desc    Get all configs (including inactive)
 * @access  Private (Admin only)
 * @response Array of all configs
 */
router.get('/all', getAllConfigs);

/**
 * @route   GET /api/admin/booking-config/:configKey
 * @desc    Get specific config by key
 * @access  Private (Admin only)
 * @params  configKey - Config key (e.g., MINIMUM_ORDER_VALUE)
 * @response Single config object
 */
router.get('/:configKey', getConfigByKey);

/**
 * @route   GET /api/admin/booking-config/:configKey/audit-log
 * @desc    Get audit log for a specific config
 * @access  Private (Admin only)
 * @params  configKey - Config key
 * @response Audit log entries with user details
 */
router.get('/:configKey/audit-log', getConfigAuditLog);

/**
 * @route   POST /api/admin/booking-config
 * @desc    Create new booking config
 * @access  Private (Admin only)
 * @body    configKey (required), value (required), description (required), 
 *          currency (optional), metadata (optional)
 * @response Created config object
 */
router.post('/', createConfig);

/**
 * @route   PUT /api/admin/booking-config/:configKey
 * @desc    Update config value
 * @access  Private (Admin only)
 * @params  configKey - Config key to update
 * @body    value (required), reason (optional)
 * @response Updated config object with previous and new values
 */
router.put('/:configKey', updateConfigValue);

/**
 * @route   PATCH /api/admin/booking-config/:configKey/toggle
 * @desc    Toggle config active status
 * @access  Private (Admin only)
 * @params  configKey - Config key to toggle
 * @response Updated config with new status
 */
router.patch('/:configKey/toggle', toggleConfigStatus);

/**
 * @route   DELETE /api/admin/booking-config/:configKey
 * @desc    Delete config (critical configs cannot be deleted)
 * @access  Private (Admin only)
 * @params  configKey - Config key to delete
 * @response Deletion confirmation
 */
router.delete('/:configKey', deleteConfig);

export default router;

