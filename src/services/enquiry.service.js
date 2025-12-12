import Enquiry from '../models/enquiry.model.js';
import { User } from '../models/user.model.js';

/**
 * Create a new enquiry
 * @param {Object} enquiryData - Enquiry data from request
 * @param {Object} metadata - Request metadata (IP, user agent)
 * @returns {Object} Created enquiry
 */
export const createEnquiry = async (enquiryData, metadata = {}) => {
  try {
    const {
      userId,
      source,
      userDetails,
      serviceDetails,
      enquiryDetails,
    } = enquiryData;

    // If userId is provided, fetch user details
    let finalUserDetails = userDetails;
    if (userId) {
      const user = await User.findById(userId).select('name email phone');
      if (user) {
        finalUserDetails = {
          name: user.name,
          email: user.email,
          phone: user.phone,
        };
      }
    }

    // Validate required fields
    if (!finalUserDetails.name || !finalUserDetails.email || !finalUserDetails.phone) {
      throw new Error('User details (name, email, phone) are required');
    }

    if (!serviceDetails.serviceName || !serviceDetails.serviceCategory) {
      throw new Error('Service details (serviceName, serviceCategory) are required');
    }

    // Check for duplicate enquiry (same email/phone for same service within 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existingEnquiry = await Enquiry.findOne({
      'userDetails.email': finalUserDetails.email,
      'serviceDetails.serviceName': serviceDetails.serviceName,
      createdAt: { $gte: oneHourAgo },
    });

    if (existingEnquiry) {
      throw new Error(
        'You have already submitted an enquiry for this service recently. Please wait before submitting another.'
      );
    }

    // Create enquiry
    const enquiry = new Enquiry({
      userId: userId || null,
      source,
      userDetails: finalUserDetails,
      serviceDetails,
      enquiryDetails: enquiryDetails || {},
      metadata: {
        ipAddress: metadata.ipAddress || null,
        userAgent: metadata.userAgent || null,
      },
    });

    await enquiry.save();

    console.log('✅ Enquiry created successfully:', enquiry.enquiryNumber);
    return enquiry;
  } catch (error) {
    console.error('❌ Error creating enquiry:', error);
    throw error;
  }
};

/**
 * Get all enquiries with filters and pagination
 * @param {Object} filters - Filter options
 * @param {Object} options - Pagination and sorting options
 * @returns {Object} Enquiries and pagination info
 */
export const getAllEnquiries = async (filters = {}, options = {}) => {
  try {
    const result = await Enquiry.getEnquiriesWithFilters(filters, options);
    return result;
  } catch (error) {
    console.error('❌ Error fetching enquiries:', error);
    throw error;
  }
};

/**
 * Get single enquiry by ID
 * @param {String} enquiryId - Enquiry ID
 * @returns {Object} Enquiry details
 */
export const getEnquiryById = async (enquiryId) => {
  try {
    const enquiry = await Enquiry.findById(enquiryId)
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('adminNotes.addedBy', 'name');

    if (!enquiry) {
      throw new Error('Enquiry not found');
    }

    return enquiry;
  } catch (error) {
    console.error('❌ Error fetching enquiry:', error);
    throw error;
  }
};

/**
 * Get enquiry by enquiry number
 * @param {String} enquiryNumber - Enquiry number (e.g., ENQ000001)
 * @returns {Object} Enquiry details
 */
export const getEnquiryByNumber = async (enquiryNumber) => {
  try {
    const enquiry = await Enquiry.findOne({ enquiryNumber })
      .populate('userId', 'name email phone')
      .select('-adminNotes -internalComments -metadata'); // Hide admin-only fields

    if (!enquiry) {
      throw new Error('Enquiry not found');
    }

    return enquiry;
  } catch (error) {
    console.error('❌ Error fetching enquiry by number:', error);
    throw error;
  }
};

/**
 * Update enquiry status
 * @param {String} enquiryId - Enquiry ID
 * @param {String} newStatus - New status
 * @param {String} adminId - Admin user ID
 * @returns {Object} Updated enquiry
 */
export const updateEnquiryStatus = async (enquiryId, newStatus, adminId) => {
  try {
    const enquiry = await Enquiry.findById(enquiryId);

    if (!enquiry) {
      throw new Error('Enquiry not found');
    }

    // Validate status transition
    if (!enquiry.canTransitionTo(newStatus)) {
      throw new Error(
        `Cannot transition from "${enquiry.status}" to "${newStatus}"`
      );
    }

    const oldStatus = enquiry.status;
    enquiry.status = newStatus;

    // Set resolved timestamp for final statuses
    if (['converted', 'cancelled'].includes(newStatus)) {
      enquiry.resolvedAt = new Date();
    }

    await enquiry.save();

    console.log(
      `✅ Enquiry ${enquiry.enquiryNumber} status updated: ${oldStatus} → ${newStatus}`
    );

    // TODO: Send status update email to user (Phase 2)
    // await sendEnquiryStatusUpdateToUser(enquiry, oldStatus, newStatus);

    return enquiry;
  } catch (error) {
    console.error('❌ Error updating enquiry status:', error);
    throw error;
  }
};

/**
 * Update enquiry priority
 * @param {String} enquiryId - Enquiry ID
 * @param {String} priority - New priority (low, medium, high)
 * @returns {Object} Updated enquiry
 */
export const updateEnquiryPriority = async (enquiryId, priority) => {
  try {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      throw new Error('Invalid priority. Must be: low, medium, or high');
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      { priority },
      { new: true, runValidators: true }
    );

    if (!enquiry) {
      throw new Error('Enquiry not found');
    }

    console.log(`✅ Enquiry ${enquiry.enquiryNumber} priority updated to: ${priority}`);
    return enquiry;
  } catch (error) {
    console.error('❌ Error updating enquiry priority:', error);
    throw error;
  }
};

/**
 * Add admin note to enquiry
 * @param {String} enquiryId - Enquiry ID
 * @param {String} note - Note text
 * @param {String} adminId - Admin user ID
 * @returns {Object} Updated enquiry
 */
export const addAdminNote = async (enquiryId, note, adminId) => {
  try {
    if (!note || note.trim().length === 0) {
      throw new Error('Note cannot be empty');
    }

    const enquiry = await Enquiry.findById(enquiryId);

    if (!enquiry) {
      throw new Error('Enquiry not found');
    }

    enquiry.adminNotes.push({
      note: note.trim(),
      addedBy: adminId,
      addedAt: new Date(),
    });

    await enquiry.save();

    console.log(`✅ Admin note added to enquiry: ${enquiry.enquiryNumber}`);
    return enquiry;
  } catch (error) {
    console.error('❌ Error adding admin note:', error);
    throw error;
  }
};

/**
 * Assign enquiry to an admin
 * @param {String} enquiryId - Enquiry ID
 * @param {String} adminId - Admin user ID to assign
 * @returns {Object} Updated enquiry
 */
export const assignEnquiry = async (enquiryId, adminId) => {
  try {
    // Verify admin exists
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      throw new Error('Invalid admin user');
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      { assignedTo: adminId },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!enquiry) {
      throw new Error('Enquiry not found');
    }

    console.log(
      `✅ Enquiry ${enquiry.enquiryNumber} assigned to: ${admin.name}`
    );
    return enquiry;
  } catch (error) {
    console.error('❌ Error assigning enquiry:', error);
    throw error;
  }
};

/**
 * Delete enquiry (soft delete by marking as cancelled)
 * @param {String} enquiryId - Enquiry ID
 * @returns {Object} Result
 */
export const deleteEnquiry = async (enquiryId) => {
  try {
    const enquiry = await Enquiry.findById(enquiryId);

    if (!enquiry) {
      throw new Error('Enquiry not found');
    }

    // Soft delete: mark as cancelled
    enquiry.status = 'cancelled';
    enquiry.resolvedAt = new Date();
    await enquiry.save();

    console.log(`✅ Enquiry ${enquiry.enquiryNumber} deleted (soft delete)`);
    return { success: true, message: 'Enquiry deleted successfully' };
  } catch (error) {
    console.error('❌ Error deleting enquiry:', error);
    throw error;
  }
};

/**
 * Get enquiry analytics
 * @param {Object} dateRange - Start and end dates
 * @returns {Object} Analytics data
 */
export const getEnquiryAnalytics = async (dateRange = {}) => {
  try {
    const { startDate, endDate } = dateRange;
    const matchQuery = {};

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    // Aggregate statistics
    const [
      totalEnquiries,
      statusBreakdown,
      sourceBreakdown,
      priorityBreakdown,
      conversionRate,
    ] = await Promise.all([
      // Total enquiries
      Enquiry.countDocuments(matchQuery),

      // Status breakdown
      Enquiry.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Source breakdown
      Enquiry.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ]),

      // Priority breakdown
      Enquiry.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),

      // Conversion rate
      Enquiry.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            converted: {
              $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    // Calculate conversion rate percentage
    const conversionPercentage =
      conversionRate.length > 0 && conversionRate[0].total > 0
        ? ((conversionRate[0].converted / conversionRate[0].total) * 100).toFixed(2)
        : 0;

    return {
      totalEnquiries,
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      sourceBreakdown: sourceBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      priorityBreakdown: priorityBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      conversionRate: conversionPercentage,
    };
  } catch (error) {
    console.error('❌ Error fetching enquiry analytics:', error);
    throw error;
  }
};

/**
 * Check rate limit for enquiry submission
 * @param {String} ipAddress - User's IP address
 * @returns {Boolean} Whether user can submit
 */
export const checkRateLimit = async (ipAddress) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const enquiryCount = await Enquiry.countDocuments({
      'metadata.ipAddress': ipAddress,
      createdAt: { $gte: oneDayAgo },
    });

    const MAX_ENQUIRIES_PER_DAY = 5;
    return enquiryCount < MAX_ENQUIRIES_PER_DAY;
  } catch (error) {
    console.error('❌ Error checking rate limit:', error);
    // In case of error, allow submission (fail-safe)
    return true;
  }
};

