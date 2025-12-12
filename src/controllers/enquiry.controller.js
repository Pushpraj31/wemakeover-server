import * as enquiryService from '../services/enquiry.service.js';

/**
 * Create a new enquiry
 * POST /api/enquiry/submit
 * Public route
 */
export const submitEnquiry = async (req, res) => {
  try {
    const enquiryData = req.body;

    // Get metadata from request
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    // Check rate limit
    const canSubmit = await enquiryService.checkRateLimit(metadata.ipAddress);
    if (!canSubmit) {
      return res.status(429).json({
        success: false,
        message: 'Too many enquiries submitted. Please try again later.',
      });
    }

    // Create enquiry
    const enquiry = await enquiryService.createEnquiry(enquiryData, metadata);

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully! We will contact you soon.',
      data: {
        enquiryNumber: enquiry.enquiryNumber,
        status: enquiry.status,
        createdAt: enquiry.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Error in submitEnquiry controller:', error);

    // Handle specific error messages
    if (error.message.includes('already submitted an enquiry')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('required')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit enquiry. Please try again.',
    });
  }
};

/**
 * Get all enquiries with filters
 * GET /api/enquiry
 * Admin route
 */
export const getAllEnquiries = async (req, res) => {
  try {
    const {
      status,
      priority,
      source,
      startDate,
      endDate,
      searchTerm,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query;

    const filters = {
      status,
      priority,
      source,
      startDate,
      endDate,
      searchTerm,
    };

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
    };

    const result = await enquiryService.getAllEnquiries(filters, options);

    res.status(200).json({
      success: true,
      data: result.enquiries,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('❌ Error in getAllEnquiries controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiries.',
    });
  }
};

/**
 * Get single enquiry by ID
 * GET /api/enquiry/:id
 * Admin route
 */
export const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await enquiryService.getEnquiryById(id);

    res.status(200).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    console.error('❌ Error in getEnquiryById controller:', error);

    if (error.message === 'Enquiry not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiry.',
    });
  }
};

/**
 * Get enquiry status by enquiry number
 * GET /api/enquiry/status/:enquiryNumber
 * Public route
 */
export const getEnquiryStatus = async (req, res) => {
  try {
    const { enquiryNumber } = req.params;
    const enquiry = await enquiryService.getEnquiryByNumber(enquiryNumber);

    res.status(200).json({
      success: true,
      data: {
        enquiryNumber: enquiry.enquiryNumber,
        status: enquiry.status,
        serviceDetails: enquiry.serviceDetails,
        createdAt: enquiry.createdAt,
        updatedAt: enquiry.updatedAt,
      },
    });
  } catch (error) {
    console.error('❌ Error in getEnquiryStatus controller:', error);

    if (error.message === 'Enquiry not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiry status.',
    });
  }
};

/**
 * Update enquiry status
 * PATCH /api/enquiry/:id/status
 * Admin route
 */
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user?._id; // Assuming auth middleware adds user to request

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const enquiry = await enquiryService.updateEnquiryStatus(id, status, adminId);

    res.status(200).json({
      success: true,
      message: 'Enquiry status updated successfully',
      data: enquiry,
    });
  } catch (error) {
    console.error('❌ Error in updateEnquiryStatus controller:', error);

    if (error.message.includes('not found') || error.message.includes('transition')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update enquiry status.',
    });
  }
};

/**
 * Update enquiry priority
 * PATCH /api/enquiry/:id/priority
 * Admin route
 */
export const updateEnquiryPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    if (!priority) {
      return res.status(400).json({
        success: false,
        message: 'Priority is required',
      });
    }

    const enquiry = await enquiryService.updateEnquiryPriority(id, priority);

    res.status(200).json({
      success: true,
      message: 'Enquiry priority updated successfully',
      data: enquiry,
    });
  } catch (error) {
    console.error('❌ Error in updateEnquiryPriority controller:', error);

    if (error.message.includes('not found') || error.message.includes('Invalid')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update enquiry priority.',
    });
  }
};

/**
 * Add admin note to enquiry
 * POST /api/enquiry/:id/notes
 * Admin route
 */
export const addAdminNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const adminId = req.user?._id; // Assuming auth middleware adds user to request

    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Note is required',
      });
    }

    const enquiry = await enquiryService.addAdminNote(id, note, adminId);

    res.status(200).json({
      success: true,
      message: 'Admin note added successfully',
      data: enquiry,
    });
  } catch (error) {
    console.error('❌ Error in addAdminNote controller:', error);

    if (error.message.includes('not found') || error.message.includes('empty')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add admin note.',
    });
  }
};

/**
 * Assign enquiry to admin
 * PATCH /api/enquiry/:id/assign
 * Admin route
 */
export const assignEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required',
      });
    }

    const enquiry = await enquiryService.assignEnquiry(id, adminId);

    res.status(200).json({
      success: true,
      message: 'Enquiry assigned successfully',
      data: enquiry,
    });
  } catch (error) {
    console.error('❌ Error in assignEnquiry controller:', error);

    if (error.message.includes('not found') || error.message.includes('Invalid')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to assign enquiry.',
    });
  }
};

/**
 * Delete enquiry
 * DELETE /api/enquiry/:id
 * Admin route
 */
export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await enquiryService.deleteEnquiry(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('❌ Error in deleteEnquiry controller:', error);

    if (error.message === 'Enquiry not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete enquiry.',
    });
  }
};

/**
 * Get enquiry analytics
 * GET /api/enquiry/analytics
 * Admin route
 */
export const getEnquiryAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const analytics = await enquiryService.getEnquiryAnalytics({
      startDate,
      endDate,
    });

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('❌ Error in getEnquiryAnalytics controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiry analytics.',
    });
  }
};

