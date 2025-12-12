import DailySlots from '../models/dailySlots.model.js';

// Admin: Create slots for a specific date
export const createSlotsForDate = async (req, res) => {
  try {
    const { date, slots } = req.body;
    const createdBy = req.user.id;
    
    console.log('👑 Admin - Creating slots for date:', {
      date,
      slotsCount: slots.length,
      createdBy
    });
    
    // Validate slots array
    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Slots must be a non-empty array'
      });
    }
    
    // Validate each slot
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (!slot.startTime || !slot.endTime) {
        return res.status(400).json({
          success: false,
          message: `Slot ${i + 1}: startTime and endTime are required`
        });
      }
      
      if (slot.maxBookings && (slot.maxBookings < 1 || slot.maxBookings > 100)) {
        return res.status(400).json({
          success: false,
          message: `Slot ${i + 1}: maxBookings must be between 1 and 100`
        });
      }
    }
    
    const dailySlots = await DailySlots.createSlotsForDate(date, slots, createdBy);
    
    console.log('✅ Admin - Slots created successfully:', {
      date,
      slotsCreated: dailySlots.slots.length,
      dailySlotsId: dailySlots._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Slots created successfully for the date',
      data: {
        date: dailySlots.date,
        slots: dailySlots.slots,
        totalSlots: dailySlots.totalSlots,
        availableSlotsCount: dailySlots.availableSlotsCount
      }
    });
  } catch (error) {
    console.error('❌ Admin - Error creating slots:', error);
    
    if (error.message === 'Slots already exist for this date') {
      return res.status(409).json({
        success: false,
        message: 'Slots already exist for this date. Use update endpoint to modify them.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating slots for date',
      error: error.message
    });
  }
};

// Admin: Update slots for a specific date
export const updateSlotsForDate = async (req, res) => {
  try {
    const { date } = req.params;
    const { slots } = req.body;
    const updatedBy = req.user.id;
    
    console.log('👑 Admin - Updating slots for date:', {
      date,
      slotsCount: slots.length,
      updatedBy
    });
    
    // Find existing daily slots
    const dailySlots = await DailySlots.findByDate(date);
    
    if (!dailySlots) {
      return res.status(404).json({
        success: false,
        message: 'No slots found for this date'
      });
    }
    
    // Check if any slots have bookings
    const slotsWithBookings = dailySlots.slots.filter(slot => slot.currentBookings > 0);
    if (slotsWithBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update slots that have existing bookings',
        details: {
          slotsWithBookings: slotsWithBookings.map(slot => ({
            time: `${slot.startTime}-${slot.endTime}`,
            currentBookings: slot.currentBookings
          }))
        }
      });
    }
    
    // Replace all slots
    dailySlots.slots = slots.map(slot => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxBookings: slot.maxBookings || 10,
      currentBookings: 0, // Reset bookings
      isAvailable: slot.isAvailable !== undefined ? slot.isAvailable : true,
      notes: slot.notes || ''
    }));
    
    dailySlots.updatedAt = new Date();
    
    await dailySlots.save();
    
    console.log('✅ Admin - Slots updated successfully:', {
      date,
      slotsUpdated: dailySlots.slots.length
    });
    
    res.status(200).json({
      success: true,
      message: 'Slots updated successfully for the date',
      data: {
        date: dailySlots.date,
        slots: dailySlots.slots,
        totalSlots: dailySlots.totalSlots,
        availableSlotsCount: dailySlots.availableSlotsCount
      }
    });
  } catch (error) {
    console.error('❌ Admin - Error updating slots:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating slots for date',
      error: error.message
    });
  }
};

// Admin: Add a single slot to a date
export const addSlotToDate = async (req, res) => {
  try {
    const { date } = req.params;
    const slotData = req.body;
    const updatedBy = req.user.id;
    
    console.log('👑 Admin - Adding slot to date:', {
      date,
      slotData,
      updatedBy
    });
    
    const dailySlots = await DailySlots.findByDate(date);
    
    if (!dailySlots) {
      return res.status(404).json({
        success: false,
        message: 'No slots found for this date. Create slots first.'
      });
    }
    
    await dailySlots.addSlot(slotData);
    
    console.log('✅ Admin - Slot added successfully:', {
      date,
      newSlotTime: `${slotData.startTime}-${slotData.endTime}`
    });
    
    res.status(200).json({
      success: true,
      message: 'Slot added successfully',
      data: {
        date: dailySlots.date,
        slots: dailySlots.slots,
        totalSlots: dailySlots.totalSlots
      }
    });
  } catch (error) {
    console.error('❌ Admin - Error adding slot:', error);
    
    if (error.message.includes('overlaps with existing slot')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error adding slot to date',
      error: error.message
    });
  }
};

// Admin: Remove a slot from a date
export const removeSlotFromDate = async (req, res) => {
  try {
    const { date, slotId } = req.params;
    const updatedBy = req.user.id;
    
    console.log('👑 Admin - Removing slot from date:', {
      date,
      slotId,
      updatedBy
    });
    
    const dailySlots = await DailySlots.findByDate(date);
    
    if (!dailySlots) {
      return res.status(404).json({
        success: false,
        message: 'No slots found for this date'
      });
    }
    
    await dailySlots.removeSlot(slotId);
    
    console.log('✅ Admin - Slot removed successfully:', {
      date,
      slotId
    });
    
    res.status(200).json({
      success: true,
      message: 'Slot removed successfully',
      data: {
        date: dailySlots.date,
        slots: dailySlots.slots,
        totalSlots: dailySlots.totalSlots
      }
    });
  } catch (error) {
    console.error('❌ Admin - Error removing slot:', error);
    
    if (error.message === 'Slot not found') {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }
    
    if (error.message === 'Cannot remove slot with existing bookings') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove slot with existing bookings'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error removing slot from date',
      error: error.message
    });
  }
};

// Get available slots for a specific date (Public)
export const getAvailableSlotsForDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    console.log('📅 User - Fetching available slots for date:', { date });
    
    const dailySlots = await DailySlots.findByDate(date);
    
    if (!dailySlots) {
      return res.status(404).json({
        success: false,
        message: 'No slots available for this date'
      });
    }
    
    const availableSlots = dailySlots.getAvailableSlots();
    
    console.log('✅ User - Available slots retrieved:', {
      date,
      totalSlots: dailySlots.slots.length,
      availableSlots: availableSlots.length
    });
    
    res.status(200).json({
      success: true,
      message: 'Available slots retrieved successfully',
      data: {
        date: dailySlots.date,
        totalSlots: dailySlots.totalSlots,
        availableSlots: availableSlots.length,
        slots: availableSlots.map(slot => ({
          id: slot._id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          maxBookings: slot.maxBookings,
          currentBookings: slot.currentBookings,
          availableSlots: slot.maxBookings - slot.currentBookings,
          duration: slot.duration || 60 // Default 60 minutes
        }))
      }
    });
  } catch (error) {
    console.error('❌ User - Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available slots',
      error: error.message
    });
  }
};

// Admin: Get all slots for a specific date
export const getAllSlotsForDate = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;
    
    console.log('👑 Admin - Fetching all slots for date:', { date, userId });
    
    const dailySlots = await DailySlots.findByDate(date);
    
    if (!dailySlots) {
      return res.status(404).json({
        success: false,
        message: 'No slots found for this date'
      });
    }
    
    console.log('✅ Admin - All slots retrieved:', {
      date,
      totalSlots: dailySlots.slots.length,
      availableSlots: dailySlots.availableSlotsCount
    });
    
    res.status(200).json({
      success: true,
      message: 'All slots retrieved successfully',
      data: {
        date: dailySlots.date,
        createdBy: dailySlots.createdBy,
        createdAt: dailySlots.createdAt,
        updatedAt: dailySlots.updatedAt,
        totalSlots: dailySlots.totalSlots,
        availableSlotsCount: dailySlots.availableSlotsCount,
        slots: dailySlots.slots.map(slot => ({
          id: slot._id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          maxBookings: slot.maxBookings,
          currentBookings: slot.currentBookings,
          availableSlots: slot.maxBookings - slot.currentBookings,
          isAvailable: slot.isAvailable,
          notes: slot.notes
        }))
      }
    });
  } catch (error) {
    console.error('❌ Admin - Error fetching all slots:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching all slots for date',
      error: error.message
    });
  }
};

// Admin: Get slots for a date range
export const getSlotsForDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
    
    console.log('👑 Admin - Fetching slots for date range:', { startDate, endDate, userId });
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate query parameters are required'
      });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'startDate must be before endDate'
      });
    }
    
    const dailySlots = await DailySlots.find({
      date: { $gte: start, $lte: end },
      isActive: true
    }).sort({ date: 1 });
    
    console.log('✅ Admin - Slots for date range retrieved:', {
      startDate,
      endDate,
      daysWithSlots: dailySlots.length
    });
    
    res.status(200).json({
      success: true,
      message: 'Slots for date range retrieved successfully',
      data: {
        dateRange: { startDate, endDate },
        daysWithSlots: dailySlots.length,
        slots: dailySlots.map(day => ({
          date: day.date,
          totalSlots: day.totalSlots,
          availableSlotsCount: day.availableSlotsCount,
          slots: day.slots.map(slot => ({
            id: slot._id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            maxBookings: slot.maxBookings,
            currentBookings: slot.currentBookings,
            availableSlots: slot.maxBookings - slot.currentBookings,
            isAvailable: slot.isAvailable
          }))
        }))
      }
    });
  } catch (error) {
    console.error('❌ Admin - Error fetching slots for date range:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching slots for date range',
      error: error.message
    });
  }
};

// Admin: Delete all slots for a specific date
export const deleteSlotsForDate = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;
    
    console.log('👑 Admin - Deleting all slots for date:', { date, userId });
    
    const dailySlots = await DailySlots.findByDate(date);
    
    if (!dailySlots) {
      return res.status(404).json({
        success: false,
        message: 'No slots found for this date'
      });
    }
    
    // Check if any slots have bookings
    const slotsWithBookings = dailySlots.slots.filter(slot => slot.currentBookings > 0);
    if (slotsWithBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete slots that have existing bookings',
        details: {
          slotsWithBookings: slotsWithBookings.map(slot => ({
            time: `${slot.startTime}-${slot.endTime}`,
            currentBookings: slot.currentBookings
          }))
        }
      });
    }
    
    await DailySlots.findByIdAndDelete(dailySlots._id);
    
    console.log('✅ Admin - All slots deleted successfully:', { date });
    
    res.status(200).json({
      success: true,
      message: 'All slots deleted successfully for the date',
      data: {
        date,
        deletedSlotsCount: dailySlots.slots.length
      }
    });
  } catch (error) {
    console.error('❌ Admin - Error deleting slots:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting slots for date',
      error: error.message
    });
  }
};

// Admin: Get slots statistics
export const getSlotsStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('👑 Admin - Fetching slots statistics:', { userId });
    
    const totalDays = await DailySlots.countDocuments({ isActive: true });
    const totalSlots = await DailySlots.aggregate([
      { $match: { isActive: true } },
      { $project: { slotCount: { $size: '$slots' } } },
      { $group: { _id: null, total: { $sum: '$slotCount' } } }
    ]);
    
    const availableSlots = await DailySlots.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$slots' },
      { $match: { 'slots.isAvailable': true } },
      { $project: { available: { $subtract: ['$slots.maxBookings', '$slots.currentBookings'] } } },
      { $group: { _id: null, total: { $sum: '$available' } } }
    ]);
    
    const bookedSlots = await DailySlots.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$slots' },
      { $group: { _id: null, total: { $sum: '$slots.currentBookings' } } }
    ]);
    
    console.log('✅ Admin - Slots statistics retrieved:', {
      totalDays,
      totalSlots: totalSlots[0]?.total || 0,
      availableSlots: availableSlots[0]?.total || 0,
      bookedSlots: bookedSlots[0]?.total || 0
    });
    
    res.status(200).json({
      success: true,
      message: 'Slots statistics retrieved successfully',
      data: {
        statistics: {
          totalDaysWithSlots: totalDays,
          totalSlots: totalSlots[0]?.total || 0,
          availableSlots: availableSlots[0]?.total || 0,
          bookedSlots: bookedSlots[0]?.total || 0,
          utilizationRate: totalSlots[0]?.total > 0 
            ? ((bookedSlots[0]?.total || 0) / totalSlots[0].total * 100).toFixed(2) + '%'
            : '0%'
        }
      }
    });
  } catch (error) {
    console.error('❌ Admin - Error fetching slots statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching slots statistics',
      error: error.message
    });
  }
};




