import mongoose from 'mongoose';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';
import { generatePaymentReference } from '../utils/payment.utils.js';
import { combineDateAndSlot } from '../utils/bookingTime.utils.js';
import { sendCancellationNotificationToAdmin, sendCancellationConfirmationToUser, sendRescheduleNotificationToAdmin, sendRescheduleConfirmationToUser, sendPaymentConfirmationToAdmin, sendPaymentConfirmationToUser } from './email.service.js';

class BookingService {
  // Create a new booking
  async createBooking(bookingData) {
    try {
      const booking = new Booking(bookingData);
      await booking.save();
      
      return {
        success: true,
        data: booking,
        message: 'Booking created successfully'
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      
      if (error.code === 11000) {
        return {
          success: false,
          message: 'Order number already exists',
          error: 'DUPLICATE_ORDER'
        };
      }
      
      return {
        success: false,
        message: 'Failed to create booking',
        error: error.message
      };
    }
  }

  // Get all bookings for a user
  async getUserBookings(userId, options = {}) {
    try {
      const { status, dateFrom, dateTo, service, page = 1, limit = 10 } = options;
      
      const query = { userId };
      
      // Apply filters
      if (status) {
        query.status = status;
      }
      
      if (dateFrom || dateTo) {
        query['bookingDetails.date'] = {};
        if (dateFrom) query['bookingDetails.date'].$gte = new Date(dateFrom);
        if (dateTo) query['bookingDetails.date'].$lte = new Date(dateTo);
      }
      
      if (service) {
        query['services.name'] = { $regex: service, $options: 'i' };
      }
      
      // Calculate pagination
      const skip = (page - 1) * limit;
      
      // Execute query with pagination
      const [bookings, totalCount] = await Promise.all([
        Booking.find(query)
          .sort({ createdAt: -1 })
          .populate('userId', 'name email phone')
          .skip(skip)
          .limit(limit)
          .lean(),
        Booking.countDocuments(query)
      ]);
      
      const totalPages = Math.ceil(totalCount / limit);
      
      return {
        success: true,
        data: {
          bookings,
          pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        },
        message: 'Bookings retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return {
        success: false,
        message: 'Failed to fetch bookings',
        error: error.message
      };
    }
  }

  // Get a specific booking by ID
  async getBookingById(bookingId, userId = null) {
    try {
      const query = { _id: bookingId };
      
      // If userId is provided, ensure user owns the booking
      if (userId) {
        query.userId = userId;
      }
      
      const booking = await Booking.findOne(query)
        .populate('userId', 'name email phone')
        .lean();
      
      if (!booking) {
        return {
          success: false,
          message: 'Booking not found',
          error: 'NOT_FOUND'
        };
      }
      
      return {
        success: true,
        data: booking,
        message: 'Booking retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching booking:', error);
      return {
        success: false,
        message: 'Failed to fetch booking',
        error: error.message
      };
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId, status, updatedBy = 'system', notes = null) {
    try {
      const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
      
      if (!validStatuses.includes(status)) {
        return {
          success: false,
          message: 'Invalid booking status',
          error: 'INVALID_STATUS'
        };
      }
      
      const updateData = { status };
      
      // Add status-specific timestamps
      if (status === 'cancelled') {
        updateData['cancellationDetails.cancelledAt'] = new Date();
        updateData['cancellationDetails.cancelledBy'] = updatedBy;
      }
      
      if (status === 'completed') {
        updateData.completedAt = new Date();
      }
      
      if (notes) {
        updateData['notes.admin'] = notes;
      }
      
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!booking) {
        return {
          success: false,
          message: 'Booking not found',
          error: 'NOT_FOUND'
        };
      }
      
      return {
        success: true,
        data: booking,
        message: `Booking status updated to ${status}`
      };
    } catch (error) {
      console.error('Error updating booking status:', error);
      return {
        success: false,
        message: 'Failed to update booking status',
        error: error.message
      };
    }
  }

  // Cancel a booking
  async cancelBooking(bookingId, cancellationReason, cancelledBy = { id: null, role: 'customer' }) {
    try {
      const booking = await Booking.findById(bookingId).populate('userId', 'name email phone');
      
      if (!booking) {
        return {
          success: false,
          message: 'Booking not found',
          error: 'NOT_FOUND'
        };
      }
      
      // Check if booking can be cancelled (validates 24-hour rule)
      if (!booking.canBeCancelled) {
        const now = new Date();
        const bookingDateTime = combineDateAndSlot(
          booking.bookingDetails?.date,
          booking.bookingDetails?.slot
        );
        const hoursUntilBooking = bookingDateTime
          ? (bookingDateTime - now) / (1000 * 60 * 60)
          : 0;
        
        return {
          success: false,
          message: hoursUntilBooking > 0 
            ? 'Cannot cancel booking within 2 hours of service time. Please contact support for urgent cancellations.'
            : 'Cannot cancel a booking that has already passed or is completed.',
          error: 'CANNOT_CANCEL',
          canContact: true,
          supportEmail: process.env.ADMIN_EMAIL
        };
      }
      
      const cancelledById = cancelledBy?.id || null;
      const requestedRole = cancelledBy?.role;

      let cancelledByRole = 'customer';
      if (requestedRole && ['customer', 'admin', 'system'].includes(requestedRole)) {
        cancelledByRole = requestedRole;
      } else if (requestedRole === 'user') {
        cancelledByRole = 'customer';
      } else if (
        cancelledById &&
        booking.userId &&
        booking.userId._id &&
        booking.userId._id.toString() !== cancelledById.toString()
      ) {
        cancelledByRole = 'admin';
      }

      // Cancel the booking using model method
      await booking.cancelBooking(cancellationReason, cancelledByRole);
      
      // Format booking date for email
      const bookingDate = new Date(booking.bookingDetails.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Format cancellation date for email
      const cancelledAt = new Date(booking.cancellationDetails.cancelledAt).toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'short'
      });
      
      // Prepare cancellation email data
      const cancellationData = {
        orderNumber: booking.orderNumber,
        customerName: booking.userId?.name || 'N/A',
        customerEmail: booking.userId?.email || 'N/A',
        customerPhone: booking.bookingDetails?.address?.phone || booking.userId?.phone || 'N/A',
        services: booking.services,
        bookingDate: bookingDate,
        bookingSlot: booking.bookingDetails.slot,
        cancelledAt: cancelledAt,
        cancellationReason: cancellationReason || 'No reason provided',
        refundEligible: booking.cancellationDetails.refundEligible,
        refundAmount: booking.cancellationDetails.refundEligible ? booking.pricing.totalAmount : 0,
        totalAmount: booking.pricing.totalAmount,
        cancelledByRole
      };
      
      // Send cancellation emails (non-blocking - don't wait for email to complete)
      setImmediate(async () => {
        try {
          await Promise.all([
            sendCancellationNotificationToAdmin(cancellationData),
            sendCancellationConfirmationToUser(cancellationData)
          ]);
          console.log('✅ Cancellation emails sent successfully for order:', booking.orderNumber);
        } catch (emailError) {
          console.error('❌ Failed to send cancellation emails:', emailError);
          // Don't throw - we don't want to fail the cancellation if email fails
        }
      });
      
      return {
        success: true,
        data: booking,
        message: 'Booking cancelled successfully',
        refundEligible: booking.cancellationDetails.refundEligible,
        refundAmount: booking.cancellationDetails.refundEligible ? booking.pricing.totalAmount : 0
      };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return {
        success: false,
        message: 'Failed to cancel booking',
        error: error.message
      };
    }
  }

  // Reschedule a booking
  async rescheduleBooking(bookingId, newDate, newSlot, newPaymentMethod, reason, userId) {
    try {
      // 1. Fetch booking with user details
      const booking = await Booking.findById(bookingId).populate('userId', 'name email phone');
      
      if (!booking) {
        return {
          success: false,
          message: 'Booking not found',
          error: 'NOT_FOUND'
        };
      }
      
      // 2. Check if booking can be rescheduled (validates 4-hour rule, status, and count)
      if (!booking.canBeRescheduled) {
        const now = new Date();
        const bookingDateTime = combineDateAndSlot(
          booking.bookingDetails?.date,
          booking.bookingDetails?.slot
        );
        const hoursUntilBooking = bookingDateTime
          ? (bookingDateTime - now) / (1000 * 60 * 60)
          : 0;
        
        // Check specific reason for inability to reschedule
        if (['cancelled', 'completed', 'no_show'].includes(booking.status)) {
          return {
            success: false,
            message: `Cannot reschedule a ${booking.status} booking.`,
            error: 'CANNOT_RESCHEDULE',
            canContact: true,
            supportEmail: process.env.ADMIN_EMAIL
          };
        }
        
        if (booking.reschedulingDetails.rescheduleCount >= 3) {
          return {
            success: false,
            message: 'Maximum reschedule limit (3) reached. Please contact support for assistance.',
            error: 'MAX_RESCHEDULES_REACHED',
            canContact: true,
            supportEmail: process.env.ADMIN_EMAIL
          };
        }
        
        if (hoursUntilBooking <= 4) {
          return {
            success: false,
            message: 'Cannot reschedule booking within 4 hours of service time. Please contact support for urgent changes.',
            error: 'TOO_CLOSE_TO_BOOKING',
            canContact: true,
            supportEmail: process.env.ADMIN_EMAIL
          };
        }
        
        // Generic fallback
        return {
          success: false,
          message: 'This booking cannot be rescheduled at this time.',
          error: 'CANNOT_RESCHEDULE',
          canContact: true,
          supportEmail: process.env.ADMIN_EMAIL
        };
      }
      
      // 3. Validate new date is not in the past
      const newBookingDateTime = combineDateAndSlot(newDate, newSlot);
      const now = new Date();
      
      if (!newBookingDateTime || newBookingDateTime < now) {
        return {
          success: false,
          message: 'Cannot reschedule to a past date. Please select a future date.',
          error: 'INVALID_DATE'
        };
      }
      
      // 4. Check if new booking datetime is at least 4 hours from now
      const minRescheduleDateTime = new Date();
      minRescheduleDateTime.setHours(minRescheduleDateTime.getHours() + 4);
      
      if (newBookingDateTime < minRescheduleDateTime) {
        return {
          success: false,
          message: 'New booking time must be at least 4 hours from now.',
          error: 'INVALID_DATE'
        };
      }
      
      // 5. Check slot availability (optional - can be enhanced later)
      const conflictingBookings = await Booking.find({
        _id: { $ne: bookingId },
        'bookingDetails.date': newDate,
        'bookingDetails.slot': newSlot,
        status: { $in: ['confirmed', 'pending', 'in_progress'] }
      });
      
      if (conflictingBookings.length > 0) {
        return {
          success: false,
          message: 'This time slot is already booked. Please select a different slot.',
          error: 'SLOT_UNAVAILABLE'
        };
      }
      
      // 6. Determine who is rescheduling
      let rescheduledBy = 'customer';
      if (userId && booking.userId && booking.userId._id && booking.userId._id.toString() !== userId.toString()) {
        rescheduledBy = 'admin';
      }
      
      // 7. Store original details before rescheduling
      const originalDate = booking.bookingDetails.date;
      const originalSlot = booking.bookingDetails.slot;
      
      // 8. Call booking model method to reschedule
      await booking.rescheduleBooking(newDate, newSlot, newPaymentMethod, reason, rescheduledBy);
      
      // 9. Format dates for email
      const formattedOriginalDate = new Date(originalDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const formattedNewDate = new Date(newDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const rescheduledAt = new Date(booking.reschedulingDetails.rescheduledAt).toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'short'
      });
      
      // 10. Prepare reschedule email data
      const rescheduleData = {
        orderNumber: booking.orderNumber,
        customerName: booking.userId?.name || 'N/A',
        customerEmail: booking.userId?.email || 'N/A',
        customerPhone: booking.bookingDetails?.address?.phone || booking.userId?.phone || 'N/A',
        services: booking.services,
        originalDate: originalDate,
        originalSlot: originalSlot,
        newDate: newDate,
        newSlot: newSlot,
        rescheduledAt: rescheduledAt,
        rescheduleReason: reason || '',
        rescheduleCount: booking.reschedulingDetails.rescheduleCount,
        paymentMethod: booking.paymentDetails.paymentMethod,
        totalAmount: booking.pricing.totalAmount,
        address: booking.bookingDetails.address
      };
      
      // 11. Send reschedule emails (non-blocking - don't wait for email to complete)
      setImmediate(async () => {
        try {
          await Promise.all([
            sendRescheduleNotificationToAdmin(rescheduleData),
            sendRescheduleConfirmationToUser(rescheduleData)
          ]);
          console.log('✅ Reschedule emails sent successfully for order:', booking.orderNumber);
        } catch (emailError) {
          console.error('❌ Failed to send reschedule emails:', emailError);
          // Don't throw - we don't want to fail the reschedule if email fails
        }
      });
      
      // 12. Return success with updated booking
      return {
        success: true,
        data: booking,
        message: 'Booking rescheduled successfully',
        rescheduleCount: booking.reschedulingDetails.rescheduleCount,
        remainingReschedules: 3 - booking.reschedulingDetails.rescheduleCount
      };
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      return {
        success: false,
        message: 'Failed to reschedule booking',
        error: error.message
      };
    }
  }

  // Update payment status
  async updatePaymentStatus(bookingId, paymentDetails) {
    try {
      const booking = await Booking.findById(bookingId);
      
      if (!booking) {
        return {
          success: false,
          message: 'Booking not found',
          error: 'NOT_FOUND'
        };
      }
      
      await booking.completePayment(paymentDetails);
      
      return {
        success: true,
        data: booking,
        message: 'Payment status updated successfully'
      };
    } catch (error) {
      console.error('Error updating payment status:', error);
      return {
        success: false,
        message: 'Failed to update payment status',
        error: error.message
      };
    }
  }

  // Get booking statistics for a user
  async getBookingStats(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required to fetch booking stats');
      }

      // Always normalize to ObjectId for aggregation so Mongo matches correctly
      const normalizedUserId =
        typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)
          ? new mongoose.Types.ObjectId(userId)
          : userId instanceof mongoose.Types.ObjectId
          ? userId
          : null;

      const matchStage = normalizedUserId
        ? { userId: normalizedUserId }
        : { userId };

      const stats = await Booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalSpent: { $sum: '$pricing.totalAmount' },
            completedBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            cancelledBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            },
            upcomingBookings: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$bookingDetails.date', new Date()] },
                      { $in: ['$status', ['confirmed', 'pending']] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      const statusCounts = await Booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const defaultStats = {
        totalBookings: 0,
        totalSpent: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        upcomingBookings: 0
      };

      const finalStats = {
        ...defaultStats,
        ...(stats[0] || {}),
        statusBreakdown: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      };

      return {
        success: true,
        data: finalStats,
        message: 'Booking statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      return {
        success: false,
        message: 'Failed to fetch booking statistics',
        error: error.message
      };
    }
  }

  // Get upcoming bookings for a user
  async getUpcomingBookings(userId, limit = 5) {
    try {
      const bookings = await Booking.findUpcomingBookings(userId).limit(limit);
      
      return {
        success: true,
        data: bookings,
        message: 'Upcoming bookings retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      return {
        success: false,
        message: 'Failed to fetch upcoming bookings',
        error: error.message
      };
    }
  }

  // Search bookings
  async searchBookings(userId, searchQuery, options = {}) {
    try {
      const { status, dateFrom, dateTo, page = 1, limit = 10 } = options;
      
      const query = {
        userId,
        $or: [
          { orderNumber: { $regex: searchQuery, $options: 'i' } },
          { 'services.name': { $regex: searchQuery, $options: 'i' } },
          { 'bookingDetails.address.city': { $regex: searchQuery, $options: 'i' } },
          { 'bookingDetails.address.state': { $regex: searchQuery, $options: 'i' } }
        ]
      };
      
      if (status) {
        query.status = status;
      }
      
      if (dateFrom || dateTo) {
        query['bookingDetails.date'] = {};
        if (dateFrom) query['bookingDetails.date'].$gte = new Date(dateFrom);
        if (dateTo) query['bookingDetails.date'].$lte = new Date(dateTo);
      }
      
      const skip = (page - 1) * limit;
      
      const [bookings, totalCount] = await Promise.all([
        Booking.find(query)
          .sort({ createdAt: -1 })
          .populate('userId', 'name email phone')
          .skip(skip)
          .limit(limit)
          .lean(),
        Booking.countDocuments(query)
      ]);
      
      const totalPages = Math.ceil(totalCount / limit);
      
      return {
        success: true,
        data: {
          bookings,
          pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        },
        message: 'Search results retrieved successfully'
      };
    } catch (error) {
      console.error('Error searching bookings:', error);
      return {
        success: false,
        message: 'Failed to search bookings',
        error: error.message
      };
    }
  }

  // Get booking analytics (for admin)
  async getBookingAnalytics(filters = {}) {
    try {
      const { dateFrom, dateTo, status } = filters;
      
      const matchQuery = {};
      
      if (dateFrom || dateTo) {
        matchQuery.createdAt = {};
        if (dateFrom) matchQuery.createdAt.$gte = new Date(dateFrom);
        if (dateTo) matchQuery.createdAt.$lte = new Date(dateTo);
      }
      
      if (status) {
        matchQuery.status = status;
      }
      
      const analytics = await Booking.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalRevenue: { $sum: '$pricing.totalAmount' },
            averageBookingValue: { $avg: '$pricing.totalAmount' },
            statusBreakdown: {
              $push: '$status'
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalBookings: 1,
            totalRevenue: 1,
            averageBookingValue: { $round: ['$averageBookingValue', 2] },
            statusCounts: {
              $reduce: {
                input: '$statusBreakdown',
                initialValue: {},
                in: {
                  $mergeObjects: [
                    '$$value',
                    {
                      $let: {
                        vars: { status: '$$this' },
                        in: {
                          $arrayToObject: [
                            [{
                              k: '$$status',
                              v: { $add: [{ $ifNull: [{ $getField: { field: '$$status', input: '$$value' } }, 0] }, 1] }
                            }]
                          ]
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      ]);
      
      return {
        success: true,
        data: analytics[0] || {
          totalBookings: 0,
          totalRevenue: 0,
          averageBookingValue: 0,
          statusCounts: {}
        },
        message: 'Booking analytics retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching booking analytics:', error);
      return {
        success: false,
        message: 'Failed to fetch booking analytics',
        error: error.message
      };
    }
  }

  // Complete booking payment
  async completeBookingPayment(bookingId, paymentMethod, razorpayData = null) {
    try {
      console.log('💳 Starting payment completion for booking:', bookingId);
      console.log('💳 Payment method:', paymentMethod);
      console.log('💳 Razorpay data:', razorpayData ? 'provided' : 'not provided');

      const booking = await Booking.findById(bookingId).populate('userId', 'name email phone');
      
      if (!booking) {
        return {
          success: false,
          message: 'Booking not found',
          error: 'NOT_FOUND'
        };
      }
      
      console.log('💳 Booking found:', {
        orderNumber: booking.orderNumber,
        currentPaymentStatus: booking.paymentStatus,
        currentPaymentMethod: booking.paymentDetails.paymentMethod
      });

      // Validate payment status
      if (booking.paymentStatus === 'completed') {
        return {
          success: false,
          message: 'Payment already completed for this booking',
          error: 'ALREADY_PAID'
        };
      }
      
      // If online payment, verify and update with Razorpay details
      if (paymentMethod === 'online' && razorpayData) {
        console.log('💳 Processing online payment with Razorpay data');
        
        // Update booking with Razorpay details using the model method
        await booking.completePayment({
          razorpayOrderId: razorpayData.razorpayOrderId,
          razorpayPaymentId: razorpayData.razorpayPaymentId,
          razorpaySignature: razorpayData.razorpaySignature,
          paymentMethod: 'online'
        });
        
        console.log('✅ Booking payment status updated to completed');
        
        // OPTIONAL: Update Payment model for Razorpay tracking
        try {
          const paymentRecord = await Payment.findOne({ razorpayOrderId: razorpayData.razorpayOrderId });
          if (paymentRecord) {
            await paymentRecord.updatePaymentStatus('paid', {
              payment_id: razorpayData.razorpayPaymentId,
              signature: razorpayData.razorpaySignature,
              method: 'online'
            });
            console.log('✅ Payment model updated for tracking');
          }
        } catch (paymentError) {
          console.error('⚠️ Failed to update Payment model (non-critical):', paymentError);
          // Don't fail the booking payment if Payment model update fails
        }
        
        // Prepare payment confirmation email data
        const paymentData = {
          orderNumber: booking.orderNumber,
          customerName: booking.userId.name,
          customerEmail: booking.userId.email,
          customerPhone: booking.bookingDetails.address.phone || booking.userId.phone,
          services: booking.services,
          totalAmount: booking.pricing.totalAmount,
          paymentMethod: 'online',
          transactionId: razorpayData.razorpayPaymentId,
          paidAt: new Date(),
          bookingDate: booking.bookingDetails.date,
          bookingSlot: booking.bookingDetails.slot,
          address: booking.bookingDetails.address
        };
        
        // Send payment confirmation emails (non-blocking)
        setImmediate(async () => {
          try {
            await Promise.all([
              sendPaymentConfirmationToAdmin(paymentData),
              sendPaymentConfirmationToUser(paymentData)
            ]);
            console.log('✅ Payment confirmation emails sent for order:', booking.orderNumber);
          } catch (emailError) {
            console.error('❌ Failed to send payment confirmation emails:', emailError);
            // Don't throw - we don't want to fail the payment if email fails
          }
        });
      } 
      // If COD, just update payment method (payment status stays pending)
      else if (paymentMethod === 'cod') {
        console.log('💳 Updating payment method to COD');
        
        booking.paymentDetails.paymentMethod = 'cod';
        await booking.save();
        
        console.log('✅ Payment method updated to COD');
        // No emails sent for COD as payment is not completed yet
      }
      // Invalid payment method or missing Razorpay data for online
      else {
        return {
          success: false,
          message: 'Invalid payment data. For online payments, Razorpay details are required.',
          error: 'INVALID_PAYMENT_DATA'
        };
      }
      
      return {
        success: true,
        data: booking,
        message: paymentMethod === 'online' 
          ? 'Payment completed successfully' 
          : 'Payment method updated successfully'
      };
    } catch (error) {
      console.error('❌ Error completing booking payment:', error);
      return {
        success: false,
        message: 'Failed to complete payment',
        error: error.message
      };
    }
  }
}

export default new BookingService();
