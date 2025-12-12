import WorkingDays from '../models/workingDays.model.js';

// Get working days configuration
export const getWorkingDays = async (req, res) => {
  try {
    console.log('📅 WorkingDays - Fetching working days configuration');
    
    const workingDays = await WorkingDays.getAllWorkingDays();
    
    // Ensure we have all 7 days
    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const completeWorkingDays = daysOfWeek.map(dayOfWeek => {
      const existingDay = workingDays.find(day => day.dayOfWeek === dayOfWeek);
      
      if (existingDay) {
        return existingDay.toSafeObject();
      } else {
        // Return default non-working day
        return {
          dayOfWeek,
          dayName: dayNames[dayOfWeek],
          isWorking: false,
          startTime: null,
          endTime: null,
          breakStart: null,
          breakEnd: null,
          isActive: false
        };
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Working days configuration retrieved successfully',
      data: {
        workingDays: completeWorkingDays
      }
    });
  } catch (error) {
    console.error('❌ WorkingDays - Error fetching working days:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving working days configuration',
      error: error.message
    });
  }
};

// Admin: Create or update working day configuration
export const createOrUpdateWorkingDay = async (req, res) => {
  try {
    const { dayOfWeek, isWorking, startTime, endTime, breakStart, breakEnd } = req.body;
    const createdBy = req.user.id;
    
    console.log('👑 Admin - Creating/updating working day:', {
      dayOfWeek,
      isWorking,
      startTime,
      endTime,
      breakStart,
      breakEnd,
      createdBy
    });
    
    // Validate day of week
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({
        success: false,
        message: 'Day of week must be between 0 (Sunday) and 6 (Saturday).'
      });
    }
    
    // Check if working day already exists
    let workingDay = await WorkingDays.findOne({ dayOfWeek });
    
    if (workingDay) {
      // Update existing working day
      workingDay.isWorking = isWorking;
      workingDay.startTime = isWorking ? startTime : null;
      workingDay.endTime = isWorking ? endTime : null;
      workingDay.breakStart = isWorking ? breakStart : null;
      workingDay.breakEnd = isWorking ? breakEnd : null;
      workingDay.updatedBy = createdBy;
      workingDay.isActive = true;
      
      await workingDay.save();
      
      console.log('✅ Admin - Working day updated:', {
        dayOfWeek,
        isWorking,
        startTime,
        endTime
      });
      
      res.status(200).json({
        success: true,
        message: 'Working day updated successfully',
        data: {
          workingDay: workingDay.toSafeObject()
        }
      });
    } else {
      // Create new working day
      workingDay = new WorkingDays({
        dayOfWeek,
        isWorking,
        startTime: isWorking ? startTime : null,
        endTime: isWorking ? endTime : null,
        breakStart: isWorking ? breakStart : null,
        breakEnd: isWorking ? breakEnd : null,
        createdBy,
        isActive: true
      });
      
      await workingDay.save();
      
      console.log('✅ Admin - Working day created:', {
        dayOfWeek,
        isWorking,
        startTime,
        endTime
      });
      
      res.status(201).json({
        success: true,
        message: 'Working day created successfully',
        data: {
          workingDay: workingDay.toSafeObject()
        }
      });
    }
  } catch (error) {
    console.error('❌ Admin - Error creating/updating working day:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating/updating working day configuration',
      error: error.message
    });
  }
};

// Admin: Bulk update working days
export const bulkUpdateWorkingDays = async (req, res) => {
  try {
    const { workingDays } = req.body;
    const updatedBy = req.user.id;
    
    console.log('👑 Admin - Bulk updating working days:', {
      body: req.body,
      workingDays: workingDays,
      daysCount: workingDays ? workingDays.length : 0,
      updatedBy
    });
    
    if (!workingDays) {
      return res.status(400).json({
        success: false,
        message: 'Working days data is required in request body.'
      });
    }
    
    if (!Array.isArray(workingDays)) {
      return res.status(400).json({
        success: false,
        message: 'Working days must be an array.'
      });
    }
    
    const updatePromises = workingDays.map(async (dayConfig) => {
      const { dayOfWeek, isWorking, startTime, endTime, breakStart, breakEnd } = dayConfig;
      
      if (dayOfWeek < 0 || dayOfWeek > 6) {
        throw new Error(`Invalid day of week: ${dayOfWeek}`);
      }
      
      const existingDay = await WorkingDays.findOne({ dayOfWeek });
      
      if (existingDay) {
        // Update existing day
        existingDay.isWorking = isWorking;
        existingDay.startTime = isWorking ? startTime : null;
        existingDay.endTime = isWorking ? endTime : null;
        existingDay.breakStart = isWorking ? breakStart : null;
        existingDay.breakEnd = isWorking ? breakEnd : null;
        existingDay.updatedBy = updatedBy;
        existingDay.isActive = true;
        
        return existingDay.save();
      } else {
        // Create new day
        const newDay = new WorkingDays({
          dayOfWeek,
          isWorking,
          startTime: isWorking ? startTime : null,
          endTime: isWorking ? endTime : null,
          breakStart: isWorking ? breakStart : null,
          breakEnd: isWorking ? breakEnd : null,
          createdBy: updatedBy,
          isActive: true
        });
        
        return newDay.save();
      }
    });
    
    const updatedDays = await Promise.all(updatePromises);
    
    console.log('✅ Admin - Working days bulk updated:', {
      updatedCount: updatedDays.length
    });
    
    res.status(200).json({
      success: true,
      message: 'Working days updated successfully',
      data: {
        workingDays: updatedDays.map(day => day.toSafeObject())
      }
    });
  } catch (error) {
    console.error('❌ Admin - Error bulk updating working days:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk updating working days configuration',
      error: error.message
    });
  }
};

// Admin: Delete working day (set as non-working)
export const deleteWorkingDay = async (req, res) => {
  try {
    const { dayOfWeek } = req.params;
    
    console.log('👑 Admin - Deleting working day:', { dayOfWeek });
    
    const workingDay = await WorkingDays.findOne({ dayOfWeek: parseInt(dayOfWeek) });
    
    if (!workingDay) {
      return res.status(404).json({
        success: false,
        message: 'Working day configuration not found.'
      });
    }
    
    // Set as non-working instead of deleting
    workingDay.isWorking = false;
    workingDay.startTime = null;
    workingDay.endTime = null;
    workingDay.breakStart = null;
    workingDay.breakEnd = null;
    workingDay.isActive = false;
    
    await workingDay.save();
    
    console.log('✅ Admin - Working day set as non-working:', { dayOfWeek });
    
    res.status(200).json({
      success: true,
      message: 'Working day set as non-working successfully',
      data: {
        workingDay: workingDay.toSafeObject()
      }
    });
  } catch (error) {
    console.error('❌ Admin - Error deleting working day:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting working day configuration',
      error: error.message
    });
  }
};

// Get available time slots for a specific date based on working days
export const getAvailableTimeSlotsForDate = async (req, res) => {
  try {
    const { date } = req.params;
    const { slotDuration = 45 } = req.query;
    
    console.log('📅 WorkingDays - Getting available slots for date:', {
      date,
      slotDuration: parseInt(slotDuration)
    });
    
    // Validate date format
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use YYYY-MM-DD format.'
      });
    }
    
    // Get working day configuration
    const dayOfWeek = bookingDate.getDay();
    const workingDay = await WorkingDays.findOne({
      dayOfWeek,
      isActive: true
    });
    
    if (!workingDay || !workingDay.isWorking) {
      return res.status(200).json({
        success: true,
        message: 'Selected date is not a working day.',
        data: {
          date,
          isWorkingDay: false,
          availableSlots: []
        }
      });
    }
    
    // Get available time slots
    const availableSlots = workingDay.getAvailableTimeSlots(parseInt(slotDuration));
    
    console.log('✅ WorkingDays - Available slots generated:', {
      date,
      workingDay: workingDay.dayName,
      slotsCount: availableSlots.length
    });
    
    res.status(200).json({
      success: true,
      message: 'Available time slots retrieved successfully',
      data: {
        date,
        isWorkingDay: true,
        workingDay: {
          dayOfWeek: workingDay.dayOfWeek,
          dayName: workingDay.dayName,
          startTime: workingDay.startTime,
          endTime: workingDay.endTime,
          breakStart: workingDay.breakStart,
          breakEnd: workingDay.breakEnd
        },
        availableSlots
      }
    });
  } catch (error) {
    console.error('❌ WorkingDays - Error getting available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving available time slots',
      error: error.message
    });
  }
};

// Check if a specific date is a working day
export const checkWorkingDay = async (req, res) => {
  try {
    const { date } = req.params;
    
    console.log('📅 WorkingDays - Checking if date is working day:', { date });
    
    // Validate date format
    const checkDate = new Date(date);
    if (isNaN(checkDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use YYYY-MM-DD format.'
      });
    }
    
    // Check if date is working
    const isWorking = await WorkingDays.isDateWorking(checkDate);
    
    if (isWorking) {
      const dayOfWeek = checkDate.getDay();
      const workingDay = await WorkingDays.findOne({
        dayOfWeek,
        isActive: true
      });
      
      res.status(200).json({
        success: true,
        message: 'Date is a working day.',
        data: {
          date,
          isWorkingDay: true,
          workingHours: {
            startTime: workingDay.startTime,
            endTime: workingDay.endTime,
            breakStart: workingDay.breakStart,
            breakEnd: workingDay.breakEnd
          }
        }
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'Date is not a working day.',
        data: {
          date,
          isWorkingDay: false
        }
      });
    }
  } catch (error) {
    console.error('❌ WorkingDays - Error checking working day:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking if date is working day',
      error: error.message
    });
  }
};

// Get working days statistics
export const getWorkingDaysStatistics = async (req, res) => {
  try {
    console.log('📊 Admin - Fetching working days statistics');
    
    const workingDays = await WorkingDays.getAllWorkingDays();
    
    const stats = {
      totalDays: 7,
      workingDays: workingDays.filter(day => day.isWorking).length,
      nonWorkingDays: 7 - workingDays.filter(day => day.isWorking).length,
      workingDaysList: workingDays.map(day => ({
        dayOfWeek: day.dayOfWeek,
        dayName: day.dayName,
        isWorking: day.isWorking,
        workingHours: day.isWorking ? {
          startTime: day.startTime,
          endTime: day.endTime,
          breakStart: day.breakStart,
          breakEnd: day.breakEnd
        } : null
      }))
    };
    
    res.status(200).json({
      success: true,
      message: 'Working days statistics retrieved successfully',
      data: {
        statistics: stats
      }
    });
  } catch (error) {
    console.error('❌ Admin - Error fetching working days statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving working days statistics',
      error: error.message
    });
  }
};
