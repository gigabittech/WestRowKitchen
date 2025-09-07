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
import { useCart } from "@/contexts/CartContext";
import { RestaurantCardSkeleton } from "@/components/skeleton-loader";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

// Restaurant logos are now served from the database

export default function Restaurants() {
  const [selectedCuisine, setSelectedCuisine] = useState("ALL");
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const { cartItems, updateQuantity, removeFromCart, cartItemCount, isCartOpen, setIsCartOpen } = useCart();
  
  useDocumentTitle(
    searchTerm 
      ? `"${searchTerm}" Restaurants - West Row Kitchen`
      : selectedCuisine !== "ALL" 
        ? `${selectedCuisine} Restaurants - West Row Kitchen`
        : "All Restaurants - West Row Kitchen"
  );

  // Get search parameter from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    } else {
      setSearchTerm("");
    }
  }, [location]);

  const { data: restaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  const filteredRestaurants = restaurants.filter((restaurant: Restaurant) => {
    const matchesSearch = searchTerm === "" || 
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (restaurant.description && restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCuisine = selectedCuisine === "ALL" || restaurant.cuisine === selectedCuisine;
    
    return matchesSearch && matchesCuisine;
  });

  const cuisineTypes = ["ALL", "Vietnamese", "Italian", "American", "Mexican", "Chinese", "Thai"];

  return (
    <div className="min-h-screen bg-background">
      
      <NavigationHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">All Restaurants</h1>
          <p className="text-gray-600 mb-6">Discover amazing local flavors from our partner restaurants</p>
          
          {/* Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {searchTerm && (
              <div className="flex items-center text-sm text-gray-600">
                <Search className="w-4 h-4 mr-2" />
                Searching for: <span className="font-medium ml-1">"{searchTerm}"</span>
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
              <Link key={restaurant.id} href={`/restaurant/${createSlug(restaurant.name)}`}>
                <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-0 shadow-md">
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/20 rounded-t-lg flex items-center justify-center overflow-hidden">
                        {restaurant.image ? (
                          <img 
                            src={restaurant.image} 
                            alt={restaurant.name}
                            className="w-32 h-32 object-contain"
                            onError={(e) => {
                              // If image fails to load, hide it and show fallback
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.parentElement?.querySelector('.fallback-logo');
                              if (fallback) {
                                (fallback as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-32 h-32 bg-gray-300 rounded-lg flex items-center justify-center fallback-logo ${
                            restaurant.image ? 'hidden' : ''
                          }`}
                        >
                          <span className="text-gray-500 text-lg font-semibold">
                            {restaurant.name.substring(0, 2)}
                          </span>
                        </div>
                      </div>
                      {(() => {
                        // Restaurant status function
                        function getRestaurantStatus(restaurantData: any) {
                          if (restaurantData.isTemporarilyClosed) return 'closed';
                          if (!restaurantData.isOpen) return 'closed';
                          
                          const now = new Date();
                          const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                          const currentTime = now.toTimeString().slice(0, 5);
                          
                          const todayHours = restaurantData.operatingHours?.[currentDay];
                          if (!todayHours || todayHours.closed) return 'closed';
                          
                          return (currentTime >= todayHours.open && currentTime <= todayHours.close) ? 'open' : 'closed';
                        }
                        
                        const status = getRestaurantStatus(restaurant);
                        const isOpen = status === 'open';
                        
                        return (
                          <Badge 
                            className={`absolute top-3 left-3 shadow-md ${
                              isOpen 
                                ? 'bg-primary hover:bg-primary/90' 
                                : 'bg-destructive hover:bg-destructive/90'
                            }`}
                          >
                            {isOpen ? 'OPEN' : 'CLOSED'}
                          </Badge>
                        );
                      })()}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 text-black group-hover:text-primary transition-colors">
                        {restaurant.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">{restaurant.cuisine}</p>
                      <p className="text-gray-500 text-xs mb-3">{restaurant.description}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="font-medium">{restaurant.rating}</span>
                            <span className="text-gray-500 ml-1">({restaurant.reviewCount || 156}+)</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-gray-500">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{restaurant.deliveryTime || "25-35"} min</span>
                          </div>
                          <div className="flex items-center">
                            <span>Min. order: ${restaurant.minimumOrder || "15.00"}</span>
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
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No restaurants found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedCuisine("ALL");
                  window.history.pushState({}, '', '/restaurants');
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