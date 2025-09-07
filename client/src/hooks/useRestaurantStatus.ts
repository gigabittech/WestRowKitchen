import { useState, useEffect } from 'react';
import { getRestaurantStatus, type RestaurantStatusResult } from '@/utils/restaurant-status';

/**
 * Hook that provides real-time restaurant status updates
 * Automatically recalculates status every minute to stay current
 */
export function useRestaurantStatus(restaurant: any): RestaurantStatusResult {
  const [status, setStatus] = useState(() => getRestaurantStatus(restaurant));

  useEffect(() => {
    if (!restaurant) return;

    // Update status immediately
    setStatus(getRestaurantStatus(restaurant));

    // Set up interval to update status every minute
    const interval = setInterval(() => {
      setStatus(getRestaurantStatus(restaurant));
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [restaurant]);

  return status;
}

/**
 * Hook for multiple restaurants - updates all statuses automatically
 */
export function useRestaurantsStatus(restaurants: any[]): Map<string, RestaurantStatusResult> {
  const [statusMap, setStatusMap] = useState(() => {
    const map = new Map<string, RestaurantStatusResult>();
    restaurants.forEach(restaurant => {
      map.set(restaurant.id, getRestaurantStatus(restaurant));
    });
    return map;
  });

  useEffect(() => {
    if (!restaurants.length) return;

    // Update all statuses immediately
    const updateStatuses = () => {
      const newStatusMap = new Map<string, RestaurantStatusResult>();
      restaurants.forEach(restaurant => {
        newStatusMap.set(restaurant.id, getRestaurantStatus(restaurant));
      });
      setStatusMap(newStatusMap);
    };

    updateStatuses();

    // Set up interval to update all statuses every minute
    const interval = setInterval(updateStatuses, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [restaurants]);

  return statusMap;
}