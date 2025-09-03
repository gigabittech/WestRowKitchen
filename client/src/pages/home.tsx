import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavigationHeader from "@/components/navigation-header";
import RestaurantCard from "@/components/restaurant-card";
import CategoryFilter from "@/components/category-filter";
import CartSidebar from "@/components/ui/cart-sidebar";

import Footer from "@/components/footer";
import { ShoppingBag, Clock, Star, TrendingUp } from "lucide-react";
import type { Restaurant, Order } from "@shared/schema";
import { useCart } from "@/contexts/CartContext";
import { RestaurantCardSkeleton } from "@/components/skeleton-loader";

export default function Home() {
  const { user } = useAuth();
  const [selectedCuisine, setSelectedCuisine] = useState<string>("ALL");
  const { cartItems, updateQuantity, removeFromCart, cartItemCount, isCartOpen, setIsCartOpen } = useCart();

  // Fetch restaurants
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery<Restaurant[]>({
    queryKey: ["restaurants", selectedCuisine],
    queryFn: async () => {
      const params = selectedCuisine !== "ALL" ? `?cuisine=${selectedCuisine}` : "";
      const response = await fetch(`/api/restaurants${params}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      return response.json();
    }
  });

  // Fetch recent orders
  const { data: recentOrders = [] } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    }
  });

  const categories = [
    { name: "American", icon: "🍔" },
    { name: "Vietnamese", icon: "🍜" },
    { name: "Italian", icon: "🍕" },
    { name: "Mexican", icon: "🌮" },
    { name: "Healthy", icon: "🥗" },
    { name: "Breakfast", icon: "🥞" },
    { name: "Desserts", icon: "🍰" },
    { name: "Drinks", icon: "🥤" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <title>Welcome Home - West Row Kitchen</title>
      
      <NavigationHeader />

      {/* Welcome Hero */}
      <section className="gradient-hero py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary mb-2">
                Welcome back, {(user as any)?.firstName || 'Food Lover'}! 👋
              </h1>
              <p className="text-gray-600">
                Ready to discover your next favorite meal?
              </p>
            </div>
            <div className="hidden md:block">
              <Card className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{recentOrders.length}</div>
                    <div className="text-sm text-gray-500">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">⭐</div>
                    <div className="text-sm text-gray-500">Favorites</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="flex items-center space-x-2" asChild>
              <Link href="/orders">
                <Clock className="w-4 h-4" />
                <span>Reorder</span>
              </Link>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2" asChild>
              <Link href="/restaurants?filter=favorites">
                <Star className="w-4 h-4" />
                <span>Favorites</span>
              </Link>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2" asChild>
              <Link href="/restaurants?filter=trending">
                <TrendingUp className="w-4 h-4" />
                <span>Trending</span>
              </Link>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2" asChild>
              <Link href="/orders">
                <ShoppingBag className="w-4 h-4" />
                <span>Order History</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <section className="py-8 bg-neutral">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentOrders.slice(0, 3).map((order: Order) => (
                <Link key={order.id} href="/orders">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">Order #{order.id.slice(-8)}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt!).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Status: <span className="capitalize font-medium">{order.status}</span>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        ${parseFloat(order.totalAmount).toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <CategoryFilter 
        categories={categories}
        selectedCuisine={selectedCuisine}
        onCuisineChange={setSelectedCuisine}
      />

      {/* Restaurants */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              {selectedCuisine === "ALL" ? "All Restaurants" : `${selectedCuisine} Restaurants`}
            </h2>
            <div className="text-sm text-gray-500">
              {restaurants.length} restaurants found
            </div>
          </div>
          
          {restaurantsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(9)].map((_, i) => (
                <RestaurantCardSkeleton key={i} />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold mb-2">No restaurants found</h3>
              <p className="text-gray-600">
                {selectedCuisine === "ALL" 
                  ? "No restaurants are available at the moment."
                  : `No ${selectedCuisine} restaurants found. Try a different cuisine.`
                }
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map((restaurant: Restaurant) => (
                <RestaurantCard 
                  key={restaurant.id} 
                  restaurant={restaurant}
                />
              ))}
            </div>
          )}
          
          {/* View All Restaurants Button */}
          <div className="text-center mt-8">
            <Button size="lg" asChild>
              <Link href="/restaurants">View All Restaurants</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Cart sidebar now handled globally by UniversalCartSidebar */}
    </div>
  );
}
