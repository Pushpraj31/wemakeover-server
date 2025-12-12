import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    // Auto-generated enquiry number
    enquiryNumber: {
      type: String,
      unique: true,
      required: true,
    },

    // User reference (optional - null for guest users)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Source of enquiry
    source: {
      type: String,
      required: true,
      enum: [
        'professional-makeup',
        'professional-mehendi',
        'bleach-detan',
        'facial',
        'hair-care',
        'waxing',
        'pedicure-manicure',
        'other',
      ],
    },

    // User details (for guest users)
    userDetails: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // Service details
    serviceDetails: {
      serviceName: {
        type: String,
        required: true,
      },
      serviceCategory: {
        type: String,
        required: true,
      },
      priceRange: {
        type: String,
        default: null,
      },
      serviceId: {
        type: String,
        default: null,
      },
    },

    // Enquiry details
    enquiryDetails: {
      message: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: '',
      },
      preferredDate: {
        type: Date,
        default: null,
      },
      preferredTimeSlot: {
        type: String,
        default: null,
      },
      additionalRequirements: {
        type: String,
        trim: true,
        maxlength: 500,
        default: '',
      },
    },

    // Status management
    status: {
      type: String,
      enum: ['pending', 'contacted', 'quoted', 'converted', 'cancelled'],
      default: 'pending',
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    // Admin notes
    adminNotes: [
      {
        note: {
          type: String,
          required: true,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    internalComments: {
      type: String,
      default: '',
    },

    // Metadata for spam prevention
    metadata: {
      ipAddress: {
        type: String,
        default: null,
      },
      userAgent: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create index for better query performance
enquirySchema.index({ enquiryNumber: 1 });
enquirySchema.index({ status: 1 });
enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ 'userDetails.email': 1 });
enquirySchema.index({ userId: 1 });

// Pre-validate middleware to generate enquiry number (runs BEFORE validation)
enquirySchema.pre('validate', async function (next) {
  // Only generate enquiry number for new documents that don't already have one
  if (this.isNew && !this.enquiryNumber) {
    try {
      // Use this.constructor to access the Enquiry model
      // This works because the hook runs in the context of a document instance
      const EnquiryModel = this.constructor;
      
      // Find the latest enquiry number
      const lastEnquiry = await EnquiryModel
        .findOne({}, { enquiryNumber: 1 })
        .sort({ createdAt: -1 })
        .lean();

      let newNumber = 1;
      if (lastEnquiry && lastEnquiry.enquiryNumber) {
        // Extract number from format "ENQ000001"
        const lastNumber = parseInt(lastEnquiry.enquiryNumber.replace('ENQ', '')) || 0;
        if (!isNaN(lastNumber) && lastNumber > 0) {
          newNumber = lastNumber + 1;
        }
      }

      // Generate new enquiry number with padding (e.g., ENQ000001)
      this.enquiryNumber = `ENQ${String(newNumber).padStart(6, '0')}`;
      
      console.log(`📝 Generated enquiry number: ${this.enquiryNumber}`);
    } catch (error) {
      console.error('❌ Error generating enquiry number:', error);
      // Return error to prevent save if number generation fails
      return next(error);
    }
  }
  next();
});

// Post-save middleware to send email notifications
enquirySchema.post('save', async function (doc, next) {
  try {
    console.log('🔔 Enquiry saved! Sending notification emails...');

    // Import email service (dynamic import to avoid circular dependencies)
    const { sendEnquiryNotificationToAdmin, sendEnquiryConfirmationToUser } = await import(
      '../services/email.service.js'
    );

    // Send emails in non-blocking manner
    setImmediate(async () => {
      try {
        // Send notification to admin
        await sendEnquiryNotificationToAdmin(doc);
        console.log('✅ Admin notification email sent for enquiry:', doc.enquiryNumber);

        // Send confirmation to user
        await sendEnquiryConfirmationToUser(doc);
        console.log('✅ User confirmation email sent for enquiry:', doc.enquiryNumber);
      } catch (emailError) {
        console.error('❌ Failed to send enquiry emails:', emailError);
        // Don't throw - we don't want to fail the enquiry if email fails
      }
    });
  } catch (error) {
    console.error('⚠️ Error in post-save email notification:', error);
    // Don't throw error - enquiry should succeed even if email fails
  }

  if (next) next();
});

// Instance method to check if status transition is valid
enquirySchema.methods.canTransitionTo = function (newStatus) {
  const validTransitions = {
    pending: ['contacted', 'cancelled'],
    contacted: ['quoted', 'cancelled'],
    quoted: ['converted', 'cancelled'],
    converted: [], // Final state
    cancelled: [], // Final state
  };

  return validTransitions[this.status]?.includes(newStatus) || false;
};

// Static method to get enquiries with filters
enquirySchema.statics.getEnquiriesWithFilters = async function (filters = {}, options = {}) {
  const {
    status,
    priority,
    source,
    startDate,
    endDate,
    searchTerm,
  } = filters;

  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  const query = {};

  // Apply filters
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (source) query.source = source;

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Search term (name, email, phone, enquiry number)
  if (searchTerm) {
    query.$or = [
      { enquiryNumber: { $regex: searchTerm, $options: 'i' } },
      { 'userDetails.name': { $regex: searchTerm, $options: 'i' } },
      { 'userDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'userDetails.phone': { $regex: searchTerm, $options: 'i' } },
      { 'serviceDetails.serviceName': { $regex: searchTerm, $options: 'i' } },
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query
  const [enquiries, total] = await Promise.all([
    this.find(query)
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query),
  ]);

  return {
    enquiries,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const Enquiry = mongoose.model('Enquiry', enquirySchema);

export default Enquiry;

