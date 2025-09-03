import { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocationPath] = useLocation();

  // Sync search query with URL parameter
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const searchParam = params.get('search');
    if (searchParam && searchParam !== searchQuery) {
      setSearchQuery(searchParam);
    } else if (!searchParam && searchQuery) {
      setSearchQuery("");
    }
  }, [location]);

  const performSearch = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    setSearchQuery(trimmedQuery);
    
    // Update URL with search parameter
    if (trimmedQuery) {
      const currentPath = location.split('?')[0];
      const isOnRestaurantsPage = currentPath === '/restaurants';
      
      if (isOnRestaurantsPage) {
        // Update URL params without navigation
        const newUrl = `/restaurants?search=${encodeURIComponent(trimmedQuery)}`;
        window.history.pushState({}, '', newUrl);
      } else {
        // Navigate to restaurants page with search
        setLocationPath(`/restaurants?search=${encodeURIComponent(trimmedQuery)}`);
      }
    } else {
      // Clear search parameter
      const currentPath = location.split('?')[0];
      if (currentPath === '/restaurants') {
        window.history.pushState({}, '', '/restaurants');
      }
    }
  }, [location, setLocationPath]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    const currentPath = location.split('?')[0];
    if (currentPath === '/restaurants') {
      window.history.pushState({}, '', '/restaurants');
    }
  }, [location]);

  return {
    searchQuery,
    setSearchQuery: (query: string) => {
      setSearchQuery(query);
      performSearch(query);
    },
    performSearch,
    clearSearch
  };
}