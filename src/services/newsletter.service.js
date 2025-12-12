import Newsletter from '../models/newsletter.model.js';

class NewsletterService {
  /**
   * Subscribe a new email to newsletter
   * @param {Object} subscriptionData - { email, source, metadata }
   * @returns {Object} - { success, data/message }
   */
  async subscribe(subscriptionData) {
    try {
      const { email, source = 'other', metadata = {} } = subscriptionData;

      // Check if email already exists
      const existingSubscriber = await Newsletter.findOne({ email });

      if (existingSubscriber) {
        // If already active, return info message
        if (existingSubscriber.status === 'active') {
          return {
            success: true,
            alreadySubscribed: true,
            message: 'This email is already subscribed to our newsletter',
            data: existingSubscriber
          };
        }

        // If previously unsubscribed, reactivate
        if (existingSubscriber.status === 'unsubscribed') {
          await existingSubscriber.resubscribe();
          return {
            success: true,
            resubscribed: true,
            message: 'Welcome back! You have been resubscribed to our newsletter',
            data: existingSubscriber
          };
        }
      }

      // Create new subscriber
      const newSubscriber = new Newsletter({
        email,
        source,
        metadata,
        status: 'active'
      });

      await newSubscriber.save();

      return {
        success: true,
        isNew: true,
        message: 'Successfully subscribed to newsletter',
        data: newSubscriber
      };
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);

      // Handle duplicate key error (race condition)
      if (error.code === 11000) {
        return {
          success: true,
          alreadySubscribed: true,
          message: 'This email is already subscribed to our newsletter'
        };
      }

      return {
        success: false,
        message: 'Failed to subscribe to newsletter',
        error: error.message
      };
    }
  }

  /**
   * Unsubscribe using token
   * @param {String} token - Unsubscribe token
   * @returns {Object} - { success, data/message }
   */
  async unsubscribe(token) {
    try {
      const subscriber = await Newsletter.findOne({ unsubscribeToken: token });

      if (!subscriber) {
        return {
          success: false,
          message: 'Invalid unsubscribe token',
          error: 'NOT_FOUND'
        };
      }

      if (subscriber.status === 'unsubscribed') {
        return {
          success: true,
          alreadyUnsubscribed: true,
          message: 'This email is already unsubscribed',
          data: subscriber
        };
      }

      await subscriber.unsubscribe();

      return {
        success: true,
        message: 'Successfully unsubscribed from newsletter',
        data: subscriber
      };
    } catch (error) {
      console.error('Error unsubscribing from newsletter:', error);
      return {
        success: false,
        message: 'Failed to unsubscribe',
        error: error.message
      };
    }
  }

  /**
   * Unsubscribe using email
   * @param {String} email - Email address
   * @returns {Object} - { success, data/message }
   */
  async unsubscribeByEmail(email) {
    try {
      const subscriber = await Newsletter.findOne({ email });

      if (!subscriber) {
        return {
          success: false,
          message: 'Email not found in newsletter list',
          error: 'NOT_FOUND'
        };
      }

      if (subscriber.status === 'unsubscribed') {
        return {
          success: true,
          alreadyUnsubscribed: true,
          message: 'This email is already unsubscribed'
        };
      }

      await subscriber.unsubscribe();

      return {
        success: true,
        message: 'Successfully unsubscribed from newsletter',
        data: subscriber
      };
    } catch (error) {
      console.error('Error unsubscribing by email:', error);
      return {
        success: false,
        message: 'Failed to unsubscribe',
        error: error.message
      };
    }
  }

  /**
   * Update subscriber preferences
   * @param {String} email - Email address
   * @param {Object} preferences - Preference updates
   * @returns {Object} - { success, data/message }
   */
  async updatePreferences(email, preferences) {
    try {
      const subscriber = await Newsletter.findOne({ email });

      if (!subscriber) {
        return {
          success: false,
          message: 'Email not found in newsletter list',
          error: 'NOT_FOUND'
        };
      }

      // Update preferences
      subscriber.preferences = {
        ...subscriber.preferences,
        ...preferences
      };

      await subscriber.save();

      return {
        success: true,
        message: 'Preferences updated successfully',
        data: subscriber
      };
    } catch (error) {
      console.error('Error updating preferences:', error);
      return {
        success: false,
        message: 'Failed to update preferences',
        error: error.message
      };
    }
  }

  /**
   * Get all active subscribers
   * @param {Object} filters - Optional filters
   * @returns {Object} - { success, data }
   */
  async getActiveSubscribers(filters = {}) {
    try {
      const subscribers = await Newsletter.getActiveSubscribers(filters);

      return {
        success: true,
        count: subscribers.length,
        data: subscribers
      };
    } catch (error) {
      console.error('Error fetching active subscribers:', error);
      return {
        success: false,
        message: 'Failed to fetch subscribers',
        error: error.message
      };
    }
  }

  /**
   * Get newsletter statistics
   * @returns {Object} - { success, data }
   */
  async getStats() {
    try {
      const stats = await Newsletter.getStats();

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error fetching newsletter stats:', error);
      return {
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      };
    }
  }

  /**
   * Check if email is subscribed
   * @param {String} email - Email address
   * @returns {Object} - { success, isSubscribed, data }
   */
  async checkSubscription(email) {
    try {
      const subscriber = await Newsletter.findOne({ email });

      return {
        success: true,
        isSubscribed: subscriber && subscriber.status === 'active',
        data: subscriber
      };
    } catch (error) {
      console.error('Error checking subscription:', error);
      return {
        success: false,
        message: 'Failed to check subscription',
        error: error.message
      };
    }
  }

  /**
   * Increment email sent count
   * @param {String} email - Email address
   * @returns {Object} - { success }
   */
  async incrementEmailSent(email) {
    try {
      await Newsletter.findOneAndUpdate(
        { email },
        {
          $inc: { emailsSent: 1 },
          $set: { lastEmailSentAt: new Date() }
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Error incrementing email sent count:', error);
      return { success: false };
    }
  }
}

export default new NewsletterService();


