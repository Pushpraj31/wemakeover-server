import express from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';
import {
  validateSlotCreation,
  validateSlotUpdate,
  validateSingleSlot,
  sanitizeSlotData,
  validateDateParam,
  validateSlotIdParam,
  validateDateRangeParams
} from '../middlewares/dailySlots.middleware.js';
import {
  autoGenerateSlotsIfNeeded,
  checkWorkingDaysConfiguration,
  validateDateNotInPast,
  validateDateWithinRange
} from '../middlewares/slotAutomation.middleware.js';
import {
  createSlotsForDate,
  updateSlotsForDate,
  addSlotToDate,
  removeSlotFromDate,
  getAvailableSlotsForDate,
  getAllSlotsForDate,
  getSlotsForDateRange,
  deleteSlotsForDate,
  getSlotsStatistics
} from '../controllers/dailySlots.controller.js';

const router = express.Router();

// Public routes (no authentication required)
// GET /api/daily-slots/:date/available - Get available slots for a specific date (with auto-generation)
router.get(
  '/:date/available',
  validateDateParam,
  validateDateNotInPast,
  validateDateWithinRange,
  checkWorkingDaysConfiguration,
  autoGenerateSlotsIfNeeded,
  getAvailableSlotsForDate
);

// Admin routes (authentication + admin role required)
router.use(authenticateToken);
router.use(requireAdmin);

// POST /api/daily-slots - Create slots for a specific date
router.post(
  '/',
  sanitizeSlotData,
  validateSlotCreation,
  createSlotsForDate
);

// PUT /api/daily-slots/:date - Update all slots for a specific date
router.put(
  '/:date',
  validateDateParam,
  sanitizeSlotData,
  validateSlotUpdate,
  updateSlotsForDate
);

// POST /api/daily-slots/:date/slots - Add a single slot to a specific date
router.post(
  '/:date/slots',
  validateDateParam,
  sanitizeSlotData,
  validateSingleSlot,
  addSlotToDate
);

// DELETE /api/daily-slots/:date/slots/:slotId - Remove a specific slot from a date
router.delete(
  '/:date/slots/:slotId',
  validateDateParam,
  validateSlotIdParam,
  removeSlotFromDate
);

// DELETE /api/daily-slots/:date - Delete all slots for a specific date
router.delete(
  '/:date',
  validateDateParam,
  deleteSlotsForDate
);

// GET /api/daily-slots/:date - Get all slots for a specific date (Admin only)
router.get(
  '/:date',
  validateDateParam,
  getAllSlotsForDate
);

// GET /api/daily-slots - Get slots for a date range (Admin only)
router.get(
  '/',
  validateDateRangeParams,
  getSlotsForDateRange
);

// GET /api/daily-slots/admin/statistics - Get slots statistics (Admin only)
router.get(
  '/admin/statistics',
  getSlotsStatistics
);

export default router;



