import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NavigationHeader from "@/components/navigation-header";
import CartSidebar from "@/components/ui/cart-sidebar";
import Footer from "@/components/footer";
import {
  ArrowLeft,
  Star,
  Clock,
  DollarSign,
  Plus,
  Minus,
  Utensils,
} from "lucide-react";
import { Link } from "wouter";
import type { Restaurant, MenuCategory, MenuItem } from "@shared/schema";
import { slugMatches, createSlug } from "@/utils/slug";
import { useCart } from "@/hooks/useCart";
import { getFoodImage } from "@/utils/food-images";
import { MenuItemCardSkeleton } from "@/components/skeleton-loader";

// Import restaurant logos
import MyLaiLogo from "@assets/My Lai Kitchen Logo_1755170145363.png";
import PappisPizzaLogo from "@assets/Pappi's Pizza Logo_1755170145362.png";
import CheekysBurgersLogo from "@assets/Cheeky's Burgers Logo_1755170145363.png";

export default function RestaurantPage() {
  const { slug } = useParams<{ slug: string }>();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { cartItems, addToCart, updateQuantity, removeFromCart, cartItemCount } = useCart();

  // Restaurant logo mapping
  const logoMap: Record<string, string> = {
    "My Lai Kitchen": MyLaiLogo,
    "Pappi's Pizza": PappisPizzaLogo,
    "Cheeky's Burgers": CheekysBurgersLogo,
  };

  // Fetch all restaurants and find by slug
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery<
    Restaurant[]
  >({
    queryKey: ["/api/restaurants"],
  });

  const restaurant = restaurants.find((r) => slugMatches(slug || "", r.name));

  const restaurantLoading = restaurantsLoading;

  // Update document title and meta when restaurant loads
  useEffect(() => {
    if (restaurant) {
      document.title = `${restaurant.name} - West Row Kitchen`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          `Order from ${restaurant.name}. ${restaurant.description || `${restaurant.cuisine} cuisine with delivery and pickup options.`}`
        );
      }
    }
  }, [restaurant]);

  // Fetch menu categories
  const { data: categories = [] } = useQuery({
    queryKey: ["restaurant-categories", restaurant?.id],
    queryFn: async () => {
      const response = await fetch(
        `/api/restaurants/${restaurant?.id}/categories`,
        {
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json();
    },
    enabled: !!restaurant?.id,
  });

  // Fetch menu items
  const { data: menuItems = [] } = useQuery({
    queryKey: ["restaurant-menu", restaurant?.id],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${restaurant?.id}/menu`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch menu");
      }
      return response.json();
    },
    enabled: !!restaurant?.id,
  });

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          cartItemCount={cartItemCount}
        />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-3xl"></div>
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-full w-24"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {[...Array(6)].map((_, i) => (
                <MenuItemCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurantLoading && !restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Restaurant Not Found</h2>
          <p className="text-gray-600 mb-4">
            {slug
              ? `We couldn't find a restaurant matching "${slug.replace(/-/g, " ")}"`
              : "The restaurant you're looking for doesn't exist."}
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/restaurants">Browse All Restaurants</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <NavigationHeader
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cartItemCount={cartItems.length}
      />

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Restaurants
          </Button>
        </Link>
      </div>

      {/* Modern Restaurant Hero Section */}
      <section className="relative">
        {/* Hero Background */}
        <div className="h-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          {/* Restaurant Logo Overlay */}
          <div className="absolute top-6 left-6 z-10">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white/20">
              {restaurant && logoMap[restaurant.name] ? (
                <img
                  src={logoMap[restaurant.name]}
                  alt={restaurant.name}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <Utensils className="w-8 h-8 text-gray-600" />
              )}
            </div>
          </div>

          {/* Content Container */}
          <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex items-end pb-8">
            <div className="text-white space-y-4 max-w-2xl">
              <div className="flex items-center space-x-3 mb-2">
                <Badge
                  variant={restaurant?.isOpen ? "default" : "destructive"}
                  className={`text-sm font-medium px-3 py-1 ${
                    restaurant?.isOpen
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {restaurant?.isOpen ? "OPEN" : "CLOSED"}
                </Badge>
                <div className="flex items-center bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="font-semibold text-sm">
                    {restaurant?.rating}
                  </span>
                  <span className="text-white/80 ml-1 text-sm">
                    ({restaurant?.reviewCount}+ reviews)
                  </span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                {restaurant?.name}
              </h1>
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
                {restaurant?.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white/80">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    {restaurant?.deliveryTime}
                  </span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    ${restaurant?.deliveryFee} delivery fee
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Info Cards */}
        <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-1">Delivery Time</h3>
                <p className="text-gray-600">{restaurant?.deliveryTime}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3 fill-current" />
                <h3 className="font-semibold text-lg mb-1">Rating</h3>
                <p className="text-gray-600">
                  {restaurant?.rating} ({restaurant?.reviewCount}+ reviews)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-1">Delivery Fee</h3>
                <p className="text-gray-600">${restaurant?.deliveryFee}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Modern Menu Section */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Menu</h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Discover our carefully crafted dishes, made with the finest
            ingredients and delivered fresh to your door.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="w-full">
            {/* Category Filter Buttons - Matching /restaurants layout */}
            <div className="flex gap-2 overflow-x-auto w-full mb-12">
              {/* All Items Button */}
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="whitespace-nowrap"
              >
                All ({menuItems.length})
              </Button>
              
              {/* Category Buttons */}
              {categories.map((category: MenuCategory) => {
                const categoryItems = menuItems.filter((item: MenuItem) => item.categoryId === category.id);
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id?.toString() ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id?.toString() || "")}
                    className="whitespace-nowrap"
                  >
                    {category.name} ({categoryItems.length})
                  </Button>
                );
              })}
            </div>

            {/* Menu Items Display */}
            <div className="mb-8">
              <div className="text-center mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {selectedCategory === "all" ? "All Items" : categories.find((c: MenuCategory) => c.id?.toString() === selectedCategory)?.name}
                </h3>
                <p className="text-gray-600">
                  {selectedCategory === "all" 
                    ? `${menuItems.length} ${menuItems.length === 1 ? "item" : "items"} available`
                    : `${menuItems.filter((item: MenuItem) => item.categoryId?.toString() === selectedCategory).length} ${menuItems.filter((item: MenuItem) => item.categoryId?.toString() === selectedCategory).length === 1 ? "item" : "items"} available`
                  }
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {menuItems
                .filter((item: MenuItem) => 
                  selectedCategory === "all" || item.categoryId?.toString() === selectedCategory
                )
                .map((item: MenuItem) => (
                  <Card
                    key={item.id}
                    className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <CardContent className="p-0">
                      <div className="p-8 relative">
                        {/* Item Image - Clickable for details */}
                        <Link
                          href={`/restaurant/${createSlug(restaurant?.name || "")}/item/${item.id}`}
                          className="cursor-pointer"
                        >
                          <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                            {getFoodImage(item.name) ? (
                              <img 
                                src={getFoodImage(item.name)!} 
                                alt={item.name}
                                className="w-full h-full object-cover rounded-2xl"
                                data-testid={`img-food-thumb-${item.id}`}
                              />
                            ) : (
                              <Utensils className="w-10 h-10 text-primary" />
                            )}
                          </div>
                        </Link>

                        <div className="space-y-4">
                          <div>
                            {/* Title clickable for details */}
                            <Link
                              href={`/restaurant/${createSlug(restaurant?.name || "")}/item/${item.id}`}
                              className="cursor-pointer"
                            >
                              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                                {item.name}
                              </h3>
                            </Link>
                            <p className="text-gray-600 leading-relaxed text-base line-clamp-3">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="space-y-1">
                              <span className="text-3xl font-bold text-gray-900">
                                ${parseFloat(item.price).toFixed(2)}
                              </span>
                              <p className="text-sm text-gray-500">
                                per item
                              </p>
                            </div>

                            {item.isAvailable ? (
                              <Button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  addToCart(item);
                                }}
                                size="lg"
                                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 z-10 relative"
                                data-testid={`button-add-to-cart-${item.id}`}
                              >
                                <Plus className="w-5 h-5 mr-2" />
                                Add to Cart
                              </Button>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="px-4 py-2"
                              >
                                Unavailable
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute top-4 right-4 w-2 h-2 bg-primary/20 rounded-full"></div>
                        <div className="absolute top-8 right-8 w-1 h-1 bg-primary/30 rounded-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ) : (
          <Card className="p-16 text-center border-0 shadow-xl bg-gradient-to-br from-gray-50 to-white">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Utensils className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Menu Coming Soon
            </h3>
            <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
              This restaurant is carefully crafting their menu. Please check
              back later for delicious options.
            </p>
          </Card>
        )}
      </section>

      <Footer />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(id, quantity) => {
          updateQuantity(id, quantity);
        }}
        onRemoveItem={(id) => {
          removeFromCart(id);
        }}
      />
    </div>
  );
}
