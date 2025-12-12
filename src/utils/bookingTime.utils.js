/**
 * Combine a date value and a slot string (HH:MM AM/PM) into a Date instance.
 * Falls back to the provided date if slot is missing/invalid.
 */
export const combineDateAndSlot = (dateValue, slotValue) => {
  if (!dateValue) return null;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (!slotValue || typeof slotValue !== 'string') {
    return date;
  }

  const slotParts = slotValue.trim().split(' ');
  if (slotParts.length < 2) {
    return date;
  }

  const [timePart, periodRaw] = slotParts;
  const [hoursStr, minutesStr = '0'] = timePart.split(':');

  if (!hoursStr) {
    return date;
  }

  let hours = parseInt(hoursStr, 10);
  if (Number.isNaN(hours)) {
    return date;
  }

  const minutes = parseInt(minutesStr, 10);
  const safeMinutes = Number.isNaN(minutes) ? 0 : minutes;

  const period = periodRaw.toUpperCase();
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  date.setHours(hours, safeMinutes, 0, 0);
  return date;
};

export const getHoursUntilBooking = (dateValue, slotValue, referenceDate = new Date()) => {
  const bookingDateTime = combineDateAndSlot(dateValue, slotValue);
  if (!bookingDateTime) {
    return -Infinity;
  }

  return (bookingDateTime - referenceDate) / (1000 * 60 * 60);
};

