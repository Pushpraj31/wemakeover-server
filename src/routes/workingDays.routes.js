import express from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';
import {
  getWorkingDays,
  createOrUpdateWorkingDay,
  bulkUpdateWorkingDays,
  deleteWorkingDay,
  getAvailableTimeSlotsForDate,
  checkWorkingDay,
  getWorkingDaysStatistics
} from '../controllers/workingDays.controller.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getWorkingDays);
router.get('/check/:date', checkWorkingDay);
router.get('/slots/:date', getAvailableTimeSlotsForDate);

// Admin routes (require admin authentication)
router.post('/admin', authenticateToken, requireAdmin, createOrUpdateWorkingDay);
router.put('/admin/bulk', authenticateToken, requireAdmin, bulkUpdateWorkingDays);
router.delete('/admin/:dayOfWeek', authenticateToken, requireAdmin, deleteWorkingDay);
router.get('/admin/statistics', authenticateToken, requireAdmin, getWorkingDaysStatistics);

export default router;




