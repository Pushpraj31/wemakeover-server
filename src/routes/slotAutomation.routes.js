import express from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';
import { validateDateParam } from '../middlewares/dailySlots.middleware.js';
import {
  checkWorkingDaysConfiguration,
  validateDateNotInPast,
  validateDateWithinRange
} from '../middlewares/slotAutomation.middleware.js';
import {
  getSlotGenerationSummary,
  bulkGenerateSlots,
  generateSlotsForNextDays,
  generateSlotsForDate,
  getSlotsGenerationStatus
} from '../controllers/slotAutomation.controller.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/slot-automation/summary - Get working days configuration and slot generation summary
router.get(
  '/summary',
  getSlotGenerationSummary
);

// GET /api/slot-automation/status - Get slots generation status for a date range
router.get(
  '/status',
  getSlotsGenerationStatus
);

// POST /api/slot-automation/bulk-generate - Bulk generate slots for a date range
router.post(
  '/bulk-generate',
  bulkGenerateSlots
);

// GET /api/slot-automation/generate-next - Generate slots for next N days
router.get(
  '/generate-next',
  generateSlotsForNextDays
);

// POST /api/slot-automation/generate/:date - Generate slots for a specific date
router.post(
  '/generate/:date',
  validateDateParam,
  validateDateNotInPast,
  validateDateWithinRange,
  generateSlotsForDate
);

export default router;

