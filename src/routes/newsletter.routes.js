import express from 'express';
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  unsubscribeByEmail,
  updatePreferences,
  checkSubscription,
  getNewsletterStats
} from '../controllers/newsletter.controller.js';

const router = express.Router();

/**
 * @route   POST /api/newsletter/subscribe
 * @desc    Subscribe to newsletter
 * @access  Public
 * @body    { email, source }
 */
router.post('/subscribe', subscribeNewsletter);

/**
 * @route   GET /api/newsletter/unsubscribe/:token
 * @desc    Unsubscribe from newsletter using token (one-click unsubscribe)
 * @access  Public
 * @params  token - Unsubscribe token
 */
router.get('/unsubscribe/:token', unsubscribeNewsletter);

/**
 * @route   POST /api/newsletter/unsubscribe
 * @desc    Unsubscribe from newsletter using email
 * @access  Public
 * @body    { email }
 */
router.post('/unsubscribe', unsubscribeByEmail);

/**
 * @route   PUT /api/newsletter/preferences
 * @desc    Update newsletter preferences
 * @access  Public
 * @body    { email, preferences }
 */
router.put('/preferences', updatePreferences);

/**
 * @route   GET /api/newsletter/check
 * @desc    Check if email is subscribed
 * @access  Public
 * @query   email
 */
router.get('/check', checkSubscription);

/**
 * @route   GET /api/newsletter/stats
 * @desc    Get newsletter statistics
 * @access  Public (should be protected with admin middleware in production)
 */
router.get('/stats', getNewsletterStats);

export default router;


