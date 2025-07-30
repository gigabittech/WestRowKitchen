import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavigationHeader from "@/components/navigation-header";
import RestaurantCard from "@/components/restaurant-card";
import CategoryFilter from "@/components/category-filter";
import CartSidebar from "@/components/ui/cart-sidebar";
import { ShoppingBag, Clock, Star, TrendingUp } from "lucide-react";
import type { Restaurant, Order } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const [selectedCuisine, setSelectedCuisine] = useState<string>("ALL");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Fetch restaurants
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants", selectedCuisine],
  });

  // Fetch recent orders
  const { data: recentOrders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const categories = [
    { name: "American", icon: "🍔" },
    { name: "Asian", icon: "🍜" },
    { name: "Mexican", icon: "🌮" },
    { name: "Italian", icon: "🍕" },
    { name: "Healthy", icon: "🥗" },
    { name: "Breakfast", icon: "🥞" },
    { name: "Desserts", icon: "🍰" },
    { name: "Drinks", icon: "🥤" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <title>Welcome Home - West Row Kitchen</title>
      
      <NavigationHeader 
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cartItemCount={cartItems.length}
      />

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
            <Button variant="outline" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Reorder</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>Favorites</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Order History</span>
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
                <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer">
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
                <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-80"></div>
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
                  onAddToCart={(item) => setCartItems(prev => [...prev, item])}
                />
              ))}
            </div>
          )}
        </div>
      </section>

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
