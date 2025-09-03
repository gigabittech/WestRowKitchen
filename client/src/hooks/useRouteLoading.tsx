import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

export function useRouteLoading() {
  const [location] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [previousLocation, setPreviousLocation] = useState(location);

  useEffect(() => {
    if (location !== previousLocation) {
      setIsLoading(true);
      setPreviousLocation(location);
      
      // Show loading for a minimum duration to avoid flicker
      const minLoadingTime = 300;
      const startTime = Date.now();
      
      const timer = setTimeout(() => {
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsed);
        
        setTimeout(() => {
          setIsLoading(false);
        }, remainingTime);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [location, previousLocation]);

  return { isLoading, location };
}