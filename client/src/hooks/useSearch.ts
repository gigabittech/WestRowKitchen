import { useState, useCallback } from "react";
import { useLocation } from "wouter";

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const performSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setSearchQuery(query);
    // Navigate to restaurants page with search parameter
    setLocation(`/restaurants?search=${encodeURIComponent(query.trim())}`);
  }, [setLocation]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    performSearch,
    clearSearch
  };
}