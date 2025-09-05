export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

/**
 * Checks if a restaurant is currently open based on operating hours
 * @param isOpen - Whether the restaurant is open (manual override)
 * @param operatingHours - The restaurant's operating hours
 * @param isTemporarilyClosed - Whether the restaurant is temporarily closed
 * @param timezone - The restaurant's timezone (default: America/New_York)
 * @returns boolean indicating if the restaurant is currently open
 */
export function isRestaurantOpen(
  isOpen: boolean,
  operatingHours: OperatingHours | null | undefined,
  isTemporarilyClosed: boolean = false,
  timezone: string = "America/New_York"
): boolean {
  // If restaurant is manually set to closed, it's closed regardless of hours
  if (!isOpen) {
    return false;
  }

  // If temporarily closed, restaurant is closed
  if (isTemporarilyClosed) {
    return false;
  }

  // If no operating hours defined, assume closed
  if (!operatingHours) {
    return false;
  }

  try {
    // Get current time in restaurant's timezone
    const now = new Date();
    const timeInTimezone = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const currentDay = timeInTimezone.find(part => part.type === "weekday")?.value.toLowerCase() as keyof OperatingHours;
    const currentHour = parseInt(timeInTimezone.find(part => part.type === "hour")?.value || "0");
    const currentMinute = parseInt(timeInTimezone.find(part => part.type === "minute")?.value || "0");
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Get today's hours
    const todayHours = operatingHours[currentDay];
    
    // If restaurant is closed today
    if (todayHours.closed) {
      return false;
    }

    // Parse opening and closing times
    const [openHour, openMinute] = todayHours.open.split(":").map(Number);
    const [closeHour, closeMinute] = todayHours.close.split(":").map(Number);
    
    const openTimeInMinutes = openHour * 60 + openMinute;
    let closeTimeInMinutes = closeHour * 60 + closeMinute;

    // Handle case where closing time is past midnight (e.g., 02:00 next day)
    if (closeTimeInMinutes <= openTimeInMinutes) {
      closeTimeInMinutes += 24 * 60; // Add 24 hours
      
      // Check if current time is after midnight but before closing
      if (currentTimeInMinutes < openTimeInMinutes) {
        const adjustedCurrentTime = currentTimeInMinutes + 24 * 60;
        return adjustedCurrentTime >= openTimeInMinutes && adjustedCurrentTime < closeTimeInMinutes;
      }
    }

    // Normal case: opening and closing on the same day
    return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;

  } catch (error) {
    console.error("Error checking restaurant hours:", error);
    // If there's an error parsing times, assume closed for safety
    return false;
  }
}

/**
 * Gets the next opening time for a restaurant
 * @param operatingHours - The restaurant's operating hours
 * @param timezone - The restaurant's timezone
 * @returns string describing when the restaurant opens next
 */
export function getNextOpeningTime(
  operatingHours: OperatingHours | null | undefined,
  timezone: string = "America/New_York"
): string {
  if (!operatingHours) {
    return "Hours not available";
  }

  const days: (keyof OperatingHours)[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  try {
    const now = new Date();
    const timeInTimezone = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
    }).formatToParts(now);

    const currentDayName = timeInTimezone.find(part => part.type === "weekday")?.value.toLowerCase();
    const currentDayIndex = days.findIndex(day => day === currentDayName);
    
    // Check next 7 days for opening
    for (let i = 1; i <= 7; i++) {
      const dayIndex = (currentDayIndex + i) % 7;
      const dayHours = operatingHours[days[dayIndex]];
      
      if (!dayHours.closed) {
        const dayName = i === 1 ? "Tomorrow" : dayNames[dayIndex];
        return `Opens ${dayName} at ${dayHours.open}`;
      }
    }
    
    return "Closed indefinitely";
  } catch (error) {
    console.error("Error getting next opening time:", error);
    return "Hours not available";
  }
}