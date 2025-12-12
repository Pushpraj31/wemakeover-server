import cron from 'node-cron';
import WorkingDays from '../models/workingDays.model.js';
import DailySlots from '../models/dailySlots.model.js';

// Configuration
const SLOT_CONFIG = {
  DEFAULT_SLOT_DURATION: 60, // 60 minutes per slot
  DEFAULT_MAX_BOOKINGS: 5,   // 5 bookings per slot
  AUTO_GENERATE_DAYS_AHEAD: 30 // Generate slots for next 30 days
};

// Function to generate slots from working day configuration
function generateSlotsFromWorkingDay(workingDay) {
  const slots = [];
  const slotDuration = SLOT_CONFIG.DEFAULT_SLOT_DURATION;
  const maxBookings = SLOT_CONFIG.DEFAULT_MAX_BOOKINGS;
  
  // Convert times to minutes for easier calculation
  const startMinutes = workingDay.startTime.split(':').reduce((acc, time) => (60 * acc) + +time);
  const endMinutes = workingDay.endTime.split(':').reduce((acc, time) => (60 * acc) + +time);
  
  let breakStartMinutes = null;
  let breakEndMinutes = null;
  
  if (workingDay.breakStart && workingDay.breakEnd) {
    breakStartMinutes = workingDay.breakStart.split(':').reduce((acc, time) => (60 * acc) + +time);
    breakEndMinutes = workingDay.breakEnd.split(':').reduce((acc, time) => (60 * acc) + +time);
  }
  
  // Generate slots
  let currentMinutes = startMinutes;
  
  while (currentMinutes + slotDuration <= endMinutes) {
    const slotEndMinutes = currentMinutes + slotDuration;
    
    // Skip break time
    if (breakStartMinutes && breakEndMinutes) {
      // If slot overlaps with break time, skip to after break
      if (currentMinutes < breakEndMinutes && slotEndMinutes > breakStartMinutes) {
        currentMinutes = breakEndMinutes;
        continue;
      }
    }
    
    // Convert minutes back to time format
    const startTime = Math.floor(currentMinutes / 60).toString().padStart(2, '0') + 
                     ':' + (currentMinutes % 60).toString().padStart(2, '0');
    const endTime = Math.floor(slotEndMinutes / 60).toString().padStart(2, '0') + 
                   ':' + (slotEndMinutes % 60).toString().padStart(2, '0');
    
    slots.push({
      startTime,
      endTime,
      maxBookings,
      currentBookings: 0,
      isAvailable: true,
      notes: `Auto-generated slot for ${workingDay.dayName}`
    });
    
    currentMinutes += slotDuration;
  }
  
  return slots;
}

// Daily job to generate slots for upcoming days
async function dailySlotGenerationJob() {
  try {
    console.log('🤖 Starting daily slot generation job...');
    
    const startTime = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get working days configuration
    const workingDays = await WorkingDays.find({ isActive: true });
    
    if (workingDays.length === 0) {
      console.log('⚠️ No working days configured. Skipping slot generation.');
      return;
    }
    
    const workingDaysMap = {};
    workingDays.forEach(day => {
      workingDaysMap[day.dayOfWeek] = day;
    });
    
    // Generate slots for the next N days
    const endDate = new Date();
    endDate.setDate(today.getDate() + SLOT_CONFIG.AUTO_GENERATE_DAYS_AHEAD);
    
    let generatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    const currentDate = new Date(today);
    
    while (currentDate <= endDate) {
      try {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayOfWeek = currentDate.getDay();
        const workingDay = workingDaysMap[dayOfWeek];
        
        // Check if slots already exist for this date
        const existingSlots = await DailySlots.findByDate(currentDate);
        
        if (existingSlots) {
          skippedCount++;
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }
        
        // Skip if not a working day
        if (!workingDay || !workingDay.isWorking) {
          skippedCount++;
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }
        
        // Generate slots
        const slots = generateSlotsFromWorkingDay(workingDay);
        
        if (slots.length === 0) {
          skippedCount++;
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }
        
        // Create daily slots document
        const dailySlots = new DailySlots({
          date: new Date(currentDate),
          slots: slots,
          createdBy: 'system', // System-generated
          notes: `Auto-generated slots based on ${workingDay.dayName} configuration`
        });
        
        await dailySlots.save();
        
        generatedCount++;
        
        console.log(`✅ Generated slots for ${dateStr}: ${slots.length} slots`);
        
      } catch (error) {
        console.error(`❌ Error generating slots for ${currentDate.toISOString().split('T')[0]}:`, error.message);
        errorCount++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('🤖 Daily slot generation job completed:', {
      duration: `${duration}ms`,
      generatedCount,
      skippedCount,
      errorCount,
      totalProcessed: generatedCount + skippedCount + errorCount,
      dateRange: {
        from: today.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0]
      }
    });
    
  } catch (error) {
    console.error('❌ Error in daily slot generation job:', error);
  }
}

// Weekly job to generate slots for the next 3 months
async function weeklySlotGenerationJob() {
  try {
    console.log('🤖 Starting weekly slot generation job...');
    
    const startTime = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate slots for the next 90 days
    const endDate = new Date();
    endDate.setDate(today.getDate() + 90);
    
    await dailySlotGenerationJob();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('🤖 Weekly slot generation job completed:', {
      duration: `${duration}ms`,
      dateRange: {
        from: today.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0]
      }
    });
    
  } catch (error) {
    console.error('❌ Error in weekly slot generation job:', error);
  }
}

// Initialize scheduled jobs
export function initializeSlotGenerationJobs() {
  try {
    console.log('🚀 Initializing slot generation jobs...');
    
    // Daily job at 2:00 AM to generate slots for next 30 days
    cron.schedule('0 2 * * *', async () => {
      console.log('⏰ Daily slot generation job triggered at 2:00 AM');
      await dailySlotGenerationJob();
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });
    
    // Weekly job on Sunday at 3:00 AM to generate slots for next 90 days
    cron.schedule('0 3 * * 0', async () => {
      console.log('⏰ Weekly slot generation job triggered on Sunday at 3:00 AM');
      await weeklySlotGenerationJob();
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });
    
    console.log('✅ Slot generation jobs initialized successfully');
    console.log('📅 Daily job: Every day at 2:00 AM (generates 30 days ahead)');
    console.log('📅 Weekly job: Every Sunday at 3:00 AM (generates 90 days ahead)');
    
  } catch (error) {
    console.error('❌ Error initializing slot generation jobs:', error);
  }
}

// Manual trigger functions for testing
export async function triggerDailySlotGeneration() {
  console.log('🔧 Manually triggering daily slot generation...');
  await dailySlotGenerationJob();
}

export async function triggerWeeklySlotGeneration() {
  console.log('🔧 Manually triggering weekly slot generation...');
  await weeklySlotGenerationJob();
}

// Export job functions for external use
export {
  dailySlotGenerationJob,
  weeklySlotGenerationJob,
  generateSlotsFromWorkingDay
};

