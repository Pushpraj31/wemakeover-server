import express from 'express';
import * as enquiryController from '../controllers/enquiry.controller.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ========================================
// PUBLIC ROUTES (No authentication required)
// ========================================

/**
 * @route   POST /api/enquiry/submit
 * @desc    Submit a new enquiry
 * @access  Public
 */
router.post('/submit', enquiryController.submitEnquiry);

/**
 * @route   GET /api/enquiry/status/:enquiryNumber
 * @desc    Get enquiry status by enquiry number
 * @access  Public
 */
router.get('/status/:enquiryNumber', enquiryController.getEnquiryStatus);

// ========================================
// ADMIN ROUTES (Authentication + Admin role required)
// ========================================

/**
 * @route   GET /api/enquiry/analytics
 * @desc    Get enquiry analytics
 * @access  Admin
 * @note    Must be defined BEFORE /api/enquiry/:id to avoid conflicts
 */
router.get('/analytics', authenticateToken, requireAdmin, enquiryController.getEnquiryAnalytics);

/**
 * @route   GET /api/enquiry
 * @desc    Get all enquiries with filters and pagination
 * @access  Admin
 */
router.get('/', authenticateToken, requireAdmin, enquiryController.getAllEnquiries);

/**
 * @route   GET /api/enquiry/:id
 * @desc    Get single enquiry by ID
 * @access  Admin
 */
router.get('/:id', authenticateToken, requireAdmin, enquiryController.getEnquiryById);

/**
 * @route   PATCH /api/enquiry/:id/status
 * @desc    Update enquiry status
 * @access  Admin
 */
router.patch('/:id/status', authenticateToken, requireAdmin, enquiryController.updateEnquiryStatus);

/**
 * @route   PATCH /api/enquiry/:id/priority
 * @desc    Update enquiry priority
 * @access  Admin
 */
router.patch('/:id/priority', authenticateToken, requireAdmin, enquiryController.updateEnquiryPriority);

/**
 * @route   PATCH /api/enquiry/:id/assign
 * @desc    Assign enquiry to admin
 * @access  Admin
 */
router.patch('/:id/assign', authenticateToken, requireAdmin, enquiryController.assignEnquiry);

/**
 * @route   POST /api/enquiry/:id/notes
 * @desc    Add admin note to enquiry
 * @access  Admin
 */
router.post('/:id/notes', authenticateToken, requireAdmin, enquiryController.addAdminNote);

/**
 * @route   DELETE /api/enquiry/:id
 * @desc    Delete enquiry (soft delete)
 * @access  Admin
 */
router.delete('/:id', authenticateToken, requireAdmin, enquiryController.deleteEnquiry);

export default router;

