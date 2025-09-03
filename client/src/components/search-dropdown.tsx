import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, MapPin, Utensils, Clock, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Restaurant } from "@shared/schema";
import { createSlug } from "@/utils/slug";

// Import restaurant logos
import MyLaiLogo from "@assets/My Lai Kitchen Logo_1755170145363.png";
import PappisPizzaLogo from "@assets/Pappi's Pizza Logo_1755170145362.png";
import CheekysBurgersLogo from "@assets/Cheeky's Burgers Logo_1755170145363.png";

const logoMap: Record<string, string> = {
  "My Lai Kitchen": MyLaiLogo,
  "Pappi's Pizza": PappisPizzaLogo,
  "Cheeky's Burgers": CheekysBurgersLogo,
};

interface SearchDropdownProps {
  query: string;
  isVisible: boolean;
  onClose: () => void;
  onItemClick: () => void;
}

export default function SearchDropdown({ query, isVisible, onClose, onItemClick }: SearchDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Fetch all restaurants for search
  const { data: restaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
    enabled: isVisible,
  });

  // Filter results based on search query
  const filteredResults = restaurants.filter((restaurant: Restaurant) => {
    if (!query || query.length < 2) return false;
    
    const searchTerm = query.toLowerCase();
    return (
      restaurant.name.toLowerCase().includes(searchTerm) ||
      restaurant.cuisine.toLowerCase().includes(searchTerm) ||
      (restaurant.description && restaurant.description.toLowerCase().includes(searchTerm))
    );
  }).slice(0, 5); // Limit to 5 results

  // Popular search suggestions when no query
  const popularSearches = [
    { type: 'cuisine', label: 'Vietnamese Food', icon: Utensils },
    { type: 'cuisine', label: 'Italian Pizza', icon: Utensils },
    { type: 'cuisine', label: 'American Burgers', icon: Utensils },
    { type: 'restaurant', label: 'Fast Delivery', icon: Clock },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  // Debug logging - remove in production
  // console.log('Search Dropdown Debug:', { 
  //   query, 
  //   queryLength: query.length, 
  //   restaurantsCount: restaurants.length, 
  //   filteredCount: filteredResults.length,
  //   isLoading 
  // });

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
      data-testid="search-dropdown"
    >
      {query.length >= 2 ? (
        // Search Results
        <div>
          {isLoading ? (
            <div className="px-4 py-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Searching...</p>
            </div>
          ) : filteredResults.length > 0 ? (
            <>
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-600 flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  Results for "{query}"
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {filteredResults.map((restaurant: Restaurant) => {
                  const restaurantSlug = createSlug(restaurant.name);
                  const restaurantUrl = `/restaurant/${restaurantSlug}`;
                  
                  return (
                    <div
                      key={restaurant.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-3 border-b border-gray-50 last:border-b-0"
                      data-testid={`search-result-${restaurant.name.toLowerCase().replace(/\s+/g, '-')}`}
                      onMouseDown={(e) => {
                        // Use mousedown instead of click to prevent dropdown from closing first
                        e.preventDefault();
                        console.log('Mouse down on restaurant:', restaurant.name);
                        console.log('Navigating to:', restaurantUrl);
                        onItemClick();
                        // Navigate using window.location for immediate navigation
                        window.location.href = restaurantUrl;
                      }}
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {logoMap[restaurant.name] ? (
                          <img 
                            src={logoMap[restaurant.name]} 
                            alt={restaurant.name}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <Utensils className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{restaurant.name}</h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span className="truncate">{restaurant.cuisine}</span>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                            <span>{restaurant.rating}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{restaurant.deliveryTime || "25-35 min"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={restaurant.isOpen ? "default" : "secondary"}
                          className={restaurant.isOpen ? "bg-green-100 text-green-800 text-xs" : "text-xs"}
                        >
                          {restaurant.isOpen ? "Open" : "Closed"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                <Link href={`/restaurants?search=${encodeURIComponent(query)}`} onClick={onItemClick}>
                  <div className="text-sm text-primary hover:text-primary/80 cursor-pointer font-medium flex items-center justify-between">
                    <span>View all results for "{query}"</span>
                    <span>→</span>
                  </div>
                </Link>
              </div>
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No restaurants found for "{query}"</p>
              <p className="text-gray-400 text-xs mt-1">Try searching for a different cuisine or restaurant name</p>

            </div>
          )}
        </div>
      ) : (
        // Popular Searches
        <div>
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm text-gray-600 font-medium">Popular searches</p>
          </div>
          <div className="py-2">
            {popularSearches.map((item, index) => (
              <Link 
                key={index}
                href={`/restaurants?search=${encodeURIComponent(item.label)}`}
                onClick={onItemClick}
              >
                <div 
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-3"
                  data-testid={`popular-search-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}