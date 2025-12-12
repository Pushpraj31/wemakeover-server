import NewsletterService from '../services/newsletter.service.js';
import { sendWelcomeNewsletterEmail } from '../services/email.service.js';

/**
 * Subscribe to newsletter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email, source } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Get metadata from request
    const metadata = {
      userAgent: req.get('user-agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      referrer: req.get('referrer') || req.get('referer')
    };

    const result = await NewsletterService.subscribe({
      email,
      source: source || 'other',
      metadata
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Send welcome email only for new subscribers or resubscribed users
    if (result.isNew || result.resubscribed) {
      try {
        await sendWelcomeNewsletterEmail({
          email,
          unsubscribeToken: result.data.unsubscribeToken
        });
        console.log('✅ Welcome email sent to:', email);
      } catch (emailError) {
        console.error('⚠️ Failed to send welcome email:', emailError);
        // Don't fail the subscription if email fails
      }
    }

    res.status(result.isNew ? 201 : 200).json(result);
  } catch (error) {
    console.error('Error in subscribeNewsletter controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Unsubscribe from newsletter using token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Unsubscribe token is required'
      });
    }

    const result = await NewsletterService.unsubscribe(token);

    if (!result.success) {
      const statusCode = result.error === 'NOT_FOUND' ? 404 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in unsubscribeNewsletter controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Unsubscribe from newsletter using email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const unsubscribeByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await NewsletterService.unsubscribeByEmail(email);

    if (!result.success) {
      const statusCode = result.error === 'NOT_FOUND' ? 404 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in unsubscribeByEmail controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Update newsletter preferences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updatePreferences = async (req, res) => {
  try {
    const { email, preferences } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Preferences object is required'
      });
    }

    const result = await NewsletterService.updatePreferences(email, preferences);

    if (!result.success) {
      const statusCode = result.error === 'NOT_FOUND' ? 404 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in updatePreferences controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Check subscription status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const checkSubscription = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await NewsletterService.checkSubscription(email);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in checkSubscription controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get newsletter statistics (admin only - add auth middleware later)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getNewsletterStats = async (req, res) => {
  try {
    const result = await NewsletterService.getStats();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getNewsletterStats controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


