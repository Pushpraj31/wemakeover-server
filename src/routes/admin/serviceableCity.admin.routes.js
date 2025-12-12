import express from 'express';
import {
  getAllServiceableCities,
  getServiceableCityById,
  createServiceableCity,
  updateServiceableCity,
  deleteServiceableCity,
  toggleCityStatus,
  getServiceableCityStats
} from '../../controllers/admin/serviceableCity.admin.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
// import { requireAdmin } from '../../middlewares/admin.middleware.js'; // TODO: Add when admin middleware is ready

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticateToken);
// TODO: Add admin role check middleware
// router.use(requireAdmin);

/**
 * @route   GET /api/admin/serviceable-cities
 * @desc    Get all serviceable cities (including inactive)
 * @access  Private (Admin only)
 * @query   status (active/inactive), sort, page, limit
 */
router.get('/', getAllServiceableCities);

/**
 * @route   GET /api/admin/serviceable-cities/stats
 * @desc    Get statistics about serviceable cities
 * @access  Private (Admin only)
 */
router.get('/stats', getServiceableCityStats);

/**
 * @route   GET /api/admin/serviceable-cities/:id
 * @desc    Get a specific serviceable city by ID
 * @access  Private (Admin only)
 */
router.get('/:id', getServiceableCityById);

/**
 * @route   POST /api/admin/serviceable-cities
 * @desc    Add a new serviceable city
 * @access  Private (Admin only)
 * @body    { city, state, displayName, priority, coveragePincodes, description }
 */
router.post('/', createServiceableCity);

/**
 * @route   PUT /api/admin/serviceable-cities/:id
 * @desc    Update a serviceable city
 * @access  Private (Admin only)
 * @body    { city, state, displayName, priority, coveragePincodes, description }
 */
router.put('/:id', updateServiceableCity);

/**
 * @route   PATCH /api/admin/serviceable-cities/:id/toggle
 * @desc    Toggle active/inactive status of a city
 * @access  Private (Admin only)
 */
router.patch('/:id/toggle', toggleCityStatus);

/**
 * @route   DELETE /api/admin/serviceable-cities/:id
 * @desc    Delete a serviceable city
 * @access  Private (Admin only)
 */
router.delete('/:id', deleteServiceableCity);

export default router;




