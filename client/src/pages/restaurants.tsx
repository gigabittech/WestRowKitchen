import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import NavigationHeader from "@/components/navigation-header";
import CartSidebar from "@/components/ui/cart-sidebar";
import Footer from "@/components/footer";
import { Clock, Star, MapPin, Search } from "lucide-react";
import { Link } from "wouter";
import type { Restaurant } from "@shared/schema";
import { createSlug } from "@/utils/slug";
import { useRestaurantsStatus } from "@/hooks/useRestaurantStatus";
import { useCart } from "@/contexts/CartContext";
import { RestaurantCardSkeleton } from "@/components/skeleton-loader";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

// Restaurant logos are now served from the database

export default function Restaurants() {
  const [selectedCuisine, setSelectedCuisine] = useState("ALL");
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    cartItemCount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const getDefaultImage = () => {
    // Use logoMap first, then fallback to external image
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&w=400&h=250&fit=crop";
  };

  useDocumentTitle(
    searchTerm
      ? `"${searchTerm}" Restaurants - West Row Kitchen`
      : selectedCuisine !== "ALL"
      ? `${selectedCuisine} Restaurants - West Row Kitchen`
      : "All Restaurants - West Row Kitchen"
  );

  // Get search parameter from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    const searchParam = params.get("search");
    if (searchParam) {
      setSearchTerm(searchParam);
    } else {
      setSearchTerm("");
    }
  }, [location]);

  const { data: restaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  // Get real-time status for all restaurants
  const restaurantStatuses = useRestaurantsStatus(restaurants);

  const filteredRestaurants = restaurants
    .filter((restaurant: Restaurant) => {
      const matchesSearch =
        searchTerm === "" ||
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (restaurant.description &&
          restaurant.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const matchesCuisine =
        selectedCuisine === "ALL" || restaurant.cuisine === selectedCuisine;

      return matchesSearch && matchesCuisine;
    })
    .sort((a, b) => {
      // Sort by open status first (open restaurants first)
      const statusA = restaurantStatuses.get(a.id)?.isOpen ? 1 : 0;
      const statusB = restaurantStatuses.get(b.id)?.isOpen ? 1 : 0;
      return statusB - statusA; // Open restaurants (1) come before closed (0)
    });

  const cuisineTypes = [
    "ALL",
    "Vietnamese",
    "Italian",
    "American",
    "Mexican",
    "Chinese",
    "Thai",
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">All Restaurants</h1>
          <p className="text-gray-600 mb-6">
            Discover amazing local flavors from our partner restaurants
          </p>

          {/* Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {searchTerm && (
              <div className="flex items-center text-sm text-gray-600">
                <Search className="w-4 h-4 mr-2" />
                Searching for:{" "}
                <span className="font-medium ml-1">"{searchTerm}"</span>
              </div>
            )}

            {/* Cuisine Filter */}
            <div className="flex gap-2 overflow-x-auto w-full">
              {cuisineTypes.map((cuisine) => (
                <Button
                  key={cuisine}
                  variant={selectedCuisine === cuisine ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCuisine(cuisine)}
                  className="whitespace-nowrap"
                >
                  {cuisine}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant: Restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurant/${createSlug(restaurant.name)}`}
              >
                <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-0 shadow-md">
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/20 rounded-t-lg flex items-center justify-center overflow-hidden">
                        <div className="w-full h-48 flex items-center  justify-center bg-gray-50">
                          <img
                            src={
                              restaurant.image
                                ? restaurant.image.startsWith("/assets/") ||
                                  restaurant.image.startsWith("http")
                                  ? restaurant.image
                                  : `/assets/${restaurant.image}`
                                : getDefaultImage()
                            }
                            alt={restaurant.name}
                            className="w-full h-full object-contain "
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = getDefaultImage();
                            }}
                          />
                        </div>
                        <div></div>
                      </div>
                      {(() => {
                        const status = restaurantStatuses.get(restaurant.id);
                        const isOpen = status?.isOpen || false;

                        return (
                          <Badge
                            className={`absolute top-3 left-3 shadow-md ${
                              isOpen
                                ? "bg-primary hover:bg-primary/90"
                                : "bg-destructive hover:bg-destructive/90"
                            }`}
                          >
                            {isOpen ? "OPEN" : "CLOSED"}
                          </Badge>
                        );
                      })()}
                    </div>

                    <div className="p-4 flex flex-col h-40">
                      {/* Top Section */}
                      <div className="flex flex-col flex-grow overflow-hidden">
                        <h3 className="font-bold text-lg mb-1 text-black group-hover:text-primary transition-colors">
                          {restaurant.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-1 truncate">
                          {restaurant.cuisine}
                        </p>
                        <p className="text-gray-500 text-xs line-clamp-2 overflow-hidden">
                          {restaurant.description}
                        </p>
                      </div>

                      {/* Bottom Section */}
                      <div className="flex items-center justify-between text-sm mt-2">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="font-medium">
                              {restaurant.rating}
                            </span>
                            <span className="text-gray-500 ml-1">
                              ({restaurant.reviewCount || 156}+)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-gray-500">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>
                              {restaurant.deliveryTime || "25-35 min"}{" "}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span>
                              Min. order: ${restaurant.minimumOrder || "15.00"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {filteredRestaurants.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No restaurants found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCuisine("ALL");
                  window.history.pushState({}, "", "/restaurants");
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
              <Link href="/">
                <Button
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-back-home"
                >
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />

      {/* Cart sidebar now handled globally by UniversalCartSidebar */}
    </div>
  );
}
