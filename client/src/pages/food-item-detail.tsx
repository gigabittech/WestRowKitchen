import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NavigationHeader from "@/components/navigation-header";

import Footer from "@/components/footer";
import { ArrowLeft, Star, Clock, DollarSign, Plus, Minus, Heart, Share2, Utensils } from "lucide-react";
import type { Restaurant, MenuItem } from "@shared/schema";
import { slugMatches } from "@/utils/slug";
import { getFoodImage } from "@/utils/food-images";
import { useCart } from "@/contexts/CartContext";
import { FoodDetailSkeleton } from "@/components/skeleton-loader";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function FoodItemDetailPage() {
  const { restaurantSlug, itemId } = useParams<{ restaurantSlug: string; itemId: string }>();
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const { cartItems, addToCart, updateQuantity, removeFromCart, cartItemCount, isCartOpen, setIsCartOpen } = useCart();

  // Fetch all restaurants to find the one by slug
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  const restaurant = restaurants.find(r => slugMatches(restaurantSlug || '', r.name));

  // Fetch menu items for the restaurant
  const { data: menuItems = [], isLoading: menuLoading } = useQuery({
    queryKey: [`/api/restaurants/${restaurant?.id}/menu`],
    enabled: !!restaurant?.id,
  });

  const foodItem = menuItems.find((item: MenuItem) => item.id === itemId);
  const isLoading = restaurantsLoading || menuLoading;
  
  // Set document title based on food item and restaurant
  useDocumentTitle(
    foodItem && restaurant 
      ? `${foodItem.name} - ${restaurant.name} - West Row Kitchen`
      : "Food Item - West Row Kitchen"
  );

  const handleAddToCart = (item: MenuItem, qty: number) => {
    // Add items one by one to match the quantity
    for (let i = 0; i < qty; i++) {
      addToCart(item, restaurant?.name);
    }
  };

  if (isLoading) {
    return <FoodDetailSkeleton />;
  }

  if (!isLoading && (!restaurant || !foodItem)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Item Not Found</h2>
          <p className="text-gray-600 mb-4">
            The food item you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild className="w-full">
            <Link href="/restaurants">Browse Restaurants</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!restaurant || !foodItem) {
    return null;
  }

  const foodImageSrc = getFoodImage(foodItem.name);

  return (
    <div className="min-h-screen bg-background">
      
      <NavigationHeader />

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <Link href={`/restaurant/${restaurantSlug}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {restaurant.name}
          </Button>
        </Link>
      </div>

      {/* Food Item Hero Section */}
      <section className="max-w-4xl mx-auto px-4 pb-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Food Image */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl">
              {foodImageSrc ? (
                <img 
                  src={foodImageSrc} 
                  alt={foodItem.name}
                  className="w-full h-full object-cover"
                  data-testid={`img-food-${foodItem.id}`}
                />
              ) : (
                <Utensils className="w-24 h-24 text-primary/60" />
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button
                variant="secondary"
                size="icon"
                className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Food Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <Badge variant={foodItem.isAvailable ? "default" : "secondary"}>
                  {foodItem.isAvailable ? "Available" : "Unavailable"}
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Ready in 15-20 min</span>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{foodItem.name}</h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                {foodItem.description}
              </p>
              
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${parseFloat(foodItem.price).toFixed(2)}
                </span>
                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                  <span className="text-sm font-medium">4.8 (127+ reviews)</span>
                </div>
              </div>
            </div>

            {/* Restaurant Info */}
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">From {restaurant.name}</h3>
                    <p className="text-gray-600 text-sm">{restaurant.description}</p>
                  </div>
                  <Link href={`/restaurant/${restaurantSlug}`}>
                    <Button variant="outline" size="sm">
                      View Restaurant
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quantity & Add to Cart */}
            {foodItem.isAvailable && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-900">Quantity:</span>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-full"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => handleAddToCart(foodItem, quantity)}
                  size="lg"
                  className="w-full h-14 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
                  data-testid={`button-add-to-cart-${foodItem.id}`}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add {quantity} to Cart - ${(parseFloat(foodItem.price) * quantity).toFixed(2)}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Nutritional Info & Reviews */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6">Nutritional Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">320</div>
                  <div className="text-sm text-gray-600">Calories</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">12g</div>
                  <div className="text-sm text-gray-600">Protein</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">45g</div>
                  <div className="text-sm text-gray-600">Carbs</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">8g</div>
                  <div className="text-sm text-gray-600">Fat</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="font-medium text-sm">Sarah M.</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    "Absolutely delicious! Fresh ingredients and perfect portion size."
                  </p>
                </div>
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(4)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                      <Star className="w-4 h-4 text-gray-300" />
                    </div>
                    <span className="font-medium text-sm">Mike R.</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    "Great flavor and arrived hot. Would order again!"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />

      {/* Cart sidebar now handled globally by UniversalCartSidebar */}
    </div>
  );
}