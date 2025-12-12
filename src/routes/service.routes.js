import express from 'express';
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getServicesByCategory,
  getPopularServices,
  toggleServiceAvailability,
  incrementServicePopularity,
  bulkUpdateServices,
  getServiceStatistics
} from '../controllers/service.controller.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';
import {
  validateServiceCreation,
  validateServiceUpdate,
  checkServiceExists,
  sanitizeServiceData,
  paginateServices,
  filterServices
} from '../middlewares/service.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', paginateServices, filterServices, getAllServices);
router.get('/popular', getPopularServices);
router.get('/category/:category', getServicesByCategory);
router.get('/:serviceId', checkServiceExists, getServiceById);
router.patch('/:serviceId/popularity', checkServiceExists, incrementServicePopularity);

// Admin routes (authentication + admin role required)
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  sanitizeServiceData,
  validateServiceCreation,
  createService
);

router.put(
  '/:serviceId',
  authenticateToken,
  requireAdmin,
  checkServiceExists,
  sanitizeServiceData,
  validateServiceUpdate,
  updateService
);

router.patch(
  '/:serviceId/availability',
  authenticateToken,
  requireAdmin,
  checkServiceExists,
  toggleServiceAvailability
);

router.delete(
  '/:serviceId',
  authenticateToken,
  requireAdmin,
  checkServiceExists,
  deleteService
);

router.patch(
  '/bulk-update',
  authenticateToken,
  requireAdmin,
  bulkUpdateServices
);

router.get(
  '/admin/statistics',
  authenticateToken,
  requireAdmin,
  getServiceStatistics
);

export default router;
