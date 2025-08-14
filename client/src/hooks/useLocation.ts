import { useState, useEffect } from "react";

const LOCATION_STORAGE_KEY = "wrk_delivery_location";
const DEFAULT_LOCATION = "123 West Row St, Los Angeles, CA";

export function useLocation() {
  const [location, setLocation] = useState<string>(DEFAULT_LOCATION);

  useEffect(() => {
    // Load location from localStorage on mount
    const savedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (savedLocation) {
      setLocation(savedLocation);
    }
  }, []);

  const updateLocation = (newLocation: string) => {
    setLocation(newLocation);
    localStorage.setItem(LOCATION_STORAGE_KEY, newLocation);
  };

  return {
    location,
    updateLocation
  };
}