import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Search, MapPin, Utensils, Clock, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Restaurant, MenuItem } from "@shared/schema";
import { createSlug } from "@/utils/slug";
import { getFoodImage } from "@/utils/food-images";

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

export default function SearchDropdown({
  query,
  isVisible,
  onClose,
  onItemClick,
}: SearchDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  // Fetch search results for both restaurants and food items
  const {
    data: searchResults = { restaurants: [], menuItems: [] },
    isLoading,
  } = useQuery<{
    restaurants: Restaurant[];
    menuItems: (MenuItem & { restaurant: Restaurant })[];
  }>({
    queryKey: ["/api/search", query],
    queryFn: async () => {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) {
        throw new Error("Search failed");
      }
      return response.json();
    },
    enabled: isVisible && query.length >= 2,
  });

  // Popular search suggestions when no query
  const popularSearches = [
    { type: "cuisine", label: "Vietnamese Food", icon: Utensils },
    { type: "cuisine", label: "Italian Pizza", icon: Utensils },
    { type: "cuisine", label: "American Burgers", icon: Utensils },
    { type: "restaurant", label: "Fast Delivery", icon: Clock },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

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
          ) : searchResults.restaurants.length > 0 ||
            searchResults.menuItems.length > 0 ? (
            <>
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-600 flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  {searchResults.restaurants.length +
                    searchResults.menuItems.length}{" "}
                  result
                  {searchResults.restaurants.length +
                    searchResults.menuItems.length !==
                  1
                    ? "s"
                    : ""}{" "}
                  found
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {/* Restaurant Results */}
                {searchResults.restaurants.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Restaurants
                      </p>
                    </div>
                    {searchResults.restaurants.map((restaurant) => {
                      const restaurantSlug = createSlug(restaurant.name);
                      // Use actual restaurant image from database, fallback to logoMap if needed
                      const restaurantImage = restaurant.image 
                        ? (restaurant.image.startsWith('/assets/') || restaurant.image.startsWith('http') ? restaurant.image : `/assets/${restaurant.image}`)
                        : logoMap[restaurant.name];

                      return (
                        <div
                          key={restaurant.id}
                          className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-b-0"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/restaurant/${restaurantSlug}`);
                            onItemClick();
                          }}
                          data-testid={`search-result-restaurant-${restaurant.id}`}
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 mr-3">
                            {restaurantImage ? (
                              <img
                                src={restaurantImage}
                                alt={restaurant.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // If restaurant.image fails, try logoMap, then fallback to icon
                                  const target = e.target as HTMLImageElement;
                                  const fallbackLogo = logoMap[restaurant.name];
                                  if (fallbackLogo && target.src !== fallbackLogo) {
                                    target.src = fallbackLogo;
                                  } else {
                                    target.style.display = 'none';
                                    target.parentElement!.innerHTML = `
                                      <div class="w-full h-full bg-primary/10 flex items-center justify-center">
                                        <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-9m3 9l3-9"></path>
                                        </svg>
                                      </div>
                                    `;
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                <Utensils className="w-6 h-6 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {restaurant.name}
                            </h3>
                            <div className="flex items-center mt-1 space-x-3">
                              <Badge variant="secondary" className="text-xs">
                                {restaurant.cuisine}
                              </Badge>
                              {restaurant.rating &&
                                restaurant.rating !== "0.00" && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Star className="w-3 h-3 fill-current text-yellow-400 mr-1" />
                                    {restaurant.rating}
                                  </div>
                                )}
                              {restaurant.deliveryTime && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {restaurant.deliveryTime}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Food Item Results */}
                {searchResults.menuItems.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Food Items
                      </p>
                    </div>
                    {searchResults.menuItems.map((item) => {
                      const restaurantSlug = createSlug(item.restaurant.name);
                      const itemSlug = createSlug(item.name);
                      const foodImage = getFoodImage(item.name);

                      return (
                        <div
                          key={item.id}
                          className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-b-0"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(
                              `/restaurant/${restaurantSlug}/item/${item.id}`,
                            );
                            onItemClick();
                          }}
                          data-testid={`search-result-food-${item.id}`}
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 mr-3">
                            {foodImage ? (
                              <img
                                src={foodImage}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                <Utensils className="w-6 h-6 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              from {item.restaurant.name}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {item.restaurant.cuisine}
                              </Badge>
                              <span className="font-semibold text-primary">
                                ${parseFloat(item.price).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                <Link
                  href={`/restaurants?search=${encodeURIComponent(query)}`}
                  onClick={onItemClick}
                >
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
              <p className="text-gray-500 text-sm">No results found</p>
              <p className="text-gray-400 text-xs mt-1">
                Try searching with different keywords
              </p>
            </div>
          )}
        </div>
      ) : (
        // Popular Searches
        <div>
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm text-gray-600 font-medium">
              Popular searches
            </p>
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
                  data-testid={`popular-search-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
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
