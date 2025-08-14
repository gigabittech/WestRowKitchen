import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NavigationHeader from "@/components/navigation-header";
import RestaurantCard from "@/components/restaurant-card";

import CartSidebar from "@/components/ui/cart-sidebar";
import Footer from "@/components/footer";
import { 
  MapPin, 
  Search, 
  Clock, 
  Star, 
  Utensils, 
  Smartphone, 
  CheckCircle,
  Gift,
  ChevronDown
} from "lucide-react";
import type { Restaurant, Promotion } from "@shared/schema";

export default function Landing() {
  const [selectedCuisine, setSelectedCuisine] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Fetch restaurants
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery<Restaurant[]>({
    queryKey: ["landing-restaurants", selectedCuisine],
    queryFn: async () => {
      const params = selectedCuisine !== "ALL" ? `?cuisine=${selectedCuisine}` : "";
      const response = await fetch(`/api/restaurants${params}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      return response.json();
    },
    retry: false,
  });

  // Fetch promotions
  const { data: promotions = [] } = useQuery<Promotion[]>({
    queryKey: ["promotions"],
    queryFn: async () => {
      const response = await fetch("/api/promotions", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error('Failed to fetch promotions');
      }
      return response.json();
    },
    retry: false,
  });

  const featuredRestaurants = restaurants.slice(0, 6);



  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <title>West Row Kitchen - Food Delivery from Local Restaurants</title>
      <meta name="description" content="Order food delivery from the best local restaurants in your area. Fast delivery, fresh food, and amazing flavors at West Row Kitchen." />
      
      <NavigationHeader 
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cartItemCount={cartItems.length}
      />

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Fresh Food, Delivered Fast
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Order from your favorite local restaurants with fast delivery
            </p>
            
            {/* Delivery Options */}
            <div className="flex justify-center items-center space-x-6 mb-8">
              <Card className="shadow-lg border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="pt-4 pb-4 px-8">
                  <div className="text-sm text-gray-600 font-medium">🚚 Delivery</div>
                  <div className="font-bold text-black">ASAP (25-40 min)</div>
                </CardContent>
              </Card>
              <div className="text-gray-400">•</div>
              <Card className="shadow-lg border-2 border-secondary/20 hover:border-secondary/40 transition-colors">
                <CardContent className="pt-4 pb-4 px-8">
                  <div className="text-sm text-gray-600 font-medium">🏃 Pickup</div>
                  <div className="font-bold text-black">ASAP (15-20 min)</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Promotions */}
      {promotions.length > 0 && (
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white mb-8 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2 flex items-center">
                    <Gift className="mr-2" />
                    Special Offers
                  </h3>
                  <p className="text-red-100">Limited time deals from your favorite restaurants</p>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {promotions.slice(0, 3).map((promo: Promotion) => (
                <Card key={promo.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-r from-orange-400 to-red-500 rounded-t-xl flex items-center justify-center">
                    <div className="text-white text-6xl">🎉</div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="destructive">{promo.discountType.toUpperCase()}</Badge>
                      <span className="text-primary font-bold">
                        {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `$${promo.discountValue}`}
                      </span>
                    </div>
                    <h4 className="font-semibold text-lg mb-1">{promo.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{promo.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Restaurants */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Featured Restaurants</h2>
            <p className="text-gray-600">Discover amazing local flavors</p>
          </div>
          
          {restaurantsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-80"></div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRestaurants.map((restaurant: Restaurant) => (
                <RestaurantCard 
                  key={restaurant.id} 
                  restaurant={restaurant}
                  onAddToCart={(item) => setCartItems(prev => [...prev, item])}
                />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-semibold">
              View All Restaurants
            </Button>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-16 gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-4">Get the West Row Kitchen App</h2>
              <p className="text-xl mb-6 text-white/90">Order faster, track your delivery, and get exclusive app-only deals</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="mr-3" />
                  <span>Real-time order tracking</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-3" />
                  <span>Exclusive app promotions</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-3" />
                  <span>Faster checkout with saved preferences</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-3" />
                  <span>Push notifications for order updates</span>
                </li>
              </ul>
              <div className="flex space-x-4">
                <Button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-center space-x-2">
                    <Smartphone />
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="font-semibold">App Store</div>
                    </div>
                  </div>
                </Button>
                <Button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-center space-x-2">
                    <Smartphone />
                    <div className="text-left">
                      <div className="text-xs">Get it on</div>
                      <div className="font-semibold">Google Play</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
            <div className="text-center">
              <div className="max-w-sm mx-auto bg-white/10 rounded-3xl p-8 backdrop-blur-sm">
                <Smartphone className="w-32 h-32 mx-auto text-white/80" />
                <p className="text-white/80 mt-4">Mobile App Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(id, quantity) => {
          setCartItems(prev => prev.map(item => 
            item.id === id ? { ...item, quantity } : item
          ));
        }}
        onRemoveItem={(id) => {
          setCartItems(prev => prev.filter(item => item.id !== id));
        }}
      />
    </div>
  );
}
