export interface RestaurantStatusResult {
  status: 'open' | 'closed';
  isOpen: boolean;
  reason?: 'temporarily_closed' | 'manually_closed' | 'outside_hours' | 'no_hours';
  nextOpeningTime?: string;
}

/**
 * Get comprehensive restaurant status with detailed information
 */
export function getRestaurantStatus(restaurantData: any): RestaurantStatusResult {
  // Check temporary closure first
  if (restaurantData.isTemporarilyClosed) {
    return {
      status: 'closed',
      isOpen: false,
      reason: 'temporarily_closed'
    };
  }

  // Check manual closure
  if (!restaurantData.isOpen) {
    return {
      status: 'closed',
      isOpen: false,
      reason: 'manually_closed'
    };
  }

  // Check operating hours
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  
  const todayHours = restaurantData.operatingHours?.[currentDay];

  // Closed today
  if (todayHours.closed) {
    return {
      status: 'closed',
      isOpen: false,
      reason: 'outside_hours',
      nextOpeningTime: getNextOpeningTime(restaurantData.operatingHours)
    };
  }
  
  // No hours defined for today
  if (!todayHours) {
    return {
      status: 'closed',
      isOpen: false,
      reason: 'no_hours'
    };
  }

  // Check if current time is within operating hours
  const isWithinHours = isTimeWithinRange(currentTime, todayHours.open, todayHours.close);
  
  if (isWithinHours) {
    return {
      status: 'open',
      isOpen: true
    };
  } else {
    return {
      status: 'closed',
      isOpen: false,
      reason: 'outside_hours',
      nextOpeningTime: getNextOpeningTime(restaurantData.operatingHours)
    };
  }
}

/**
 * Helper function to check if current time is within operating hours
 * Handles cases where closing time is after midnight
 */
function isTimeWithinRange(currentTime: string, openTime: string, closeTime: string): boolean {
  // Convert time strings to minutes for easier comparison
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const current = timeToMinutes(currentTime);
  const open = timeToMinutes(openTime);
  const close = timeToMinutes(closeTime);

  // If close time is less than open time, restaurant closes after midnight
  if (close < open) {
    // Restaurant is open if current time is after opening OR before closing (next day)
    return current >= open || current <= close;
  } else {
    // Normal case: restaurant closes on the same day
    return current >= open && current <= close;
  }
}

/**
 * Get next opening time for a restaurant
 */
function getNextOpeningTime(operatingHours: any): string {
  if (!operatingHours) return "Check restaurant for hours";

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const now = new Date();
  const currentDayIndex = now.getDay();
  
  // Check next 7 days for opening
  for (let i = 1; i <= 7; i++) {
    const dayIndex = (currentDayIndex + i) % 7;
    const dayHours = operatingHours[days[dayIndex]];
    
    if (dayHours && !dayHours.closed) {
      const dayName = i === 1 ? "Tomorrow" : dayNames[dayIndex];
      return `Opens ${dayName} at ${dayHours.open}`;
    }
  }
  
  return "Check restaurant for hours";
}

/**
 * Get user-friendly status message
 */
export function getStatusMessage(result: RestaurantStatusResult): string {
  if (result.isOpen) {
    return "Open now";
  }

  switch (result.reason) {
    case 'temporarily_closed':
      return "Temporarily closed";
    case 'manually_closed':
      return "Closed";
    case 'outside_hours':
      return result.nextOpeningTime || "Closed";
    case 'no_hours':
      return "Hours not available";
    default:
      return "Closed";
  }
}