import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavigationHeader from "@/components/navigation-header";
import CartSidebar from "@/components/ui/cart-sidebar";
import Footer from "@/components/footer";
import { ArrowLeft, Star, Clock, DollarSign, Plus, Minus } from "lucide-react";
import { Link } from "wouter";
import type { Restaurant, MenuCategory, MenuItem } from "@shared/schema";
import { slugMatches } from "@/utils/slug";

export default function RestaurantPage() {
  const { slug } = useParams<{ slug: string }>();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Fetch all restaurants and find by slug
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  const restaurant = restaurants.find(r => slugMatches(slug || '', r.name));

  const restaurantLoading = restaurantsLoading;

  // Fetch menu categories
  const { data: categories = [] } = useQuery({
    queryKey: ["restaurant-categories", restaurant?.id],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${restaurant?.id}/categories`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
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
        throw new Error('Failed to fetch menu');
      }
      return response.json();
    },
    enabled: !!restaurant?.id,
  });

  const addToCart = (item: MenuItem) => {
    const cartItem = {
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      quantity: 1,
      restaurantId: item.restaurantId,
      image: item.image,
    };

    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, cartItem];
    });
  };

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader 
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          cartItemCount={cartItems.length}
        />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
            {slug ? `We couldn't find a restaurant matching "${slug.replace(/-/g, ' ')}"` : 'The restaurant you\'re looking for doesn\'t exist.'}
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
      <title>{restaurant?.name} - West Row Kitchen</title>
      <meta name="description" content={`Order from ${restaurant?.name}. ${restaurant?.description || `${restaurant?.cuisine} cuisine with delivery and pickup options.`}`} />
      
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

      {/* Restaurant Header */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="h-64 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl mb-6 flex items-center justify-center">
              <div className="text-white text-6xl">🍽️</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{restaurant?.name}</h1>
              <p className="text-gray-600 mb-4">{restaurant?.description}</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="font-semibold">{restaurant?.rating}</span>
                  <span className="text-gray-500 ml-1">({restaurant?.reviewCount}+ reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span>{restaurant?.deliveryTime}</span>
              </div>
              <div className="flex items-center text-sm">
                <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                <span>${restaurant?.deliveryFee} delivery fee</span>
              </div>
            </div>
            
            <Badge variant={restaurant?.isOpen ? "default" : "destructive"} className="text-sm">
              {restaurant?.isOpen ? "OPEN" : "CLOSED"}
            </Badge>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-6">Menu</h2>
        
        {categories.length > 0 ? (
          <Tabs defaultValue={categories[0]?.id} className="w-full">
            <TabsList className="grid w-full grid-cols-auto-fit mb-8">
              {categories.map((category: MenuCategory) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map((category: MenuCategory) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="grid md:grid-cols-2 gap-6">
                  {menuItems
                    .filter((item: MenuItem) => item.categoryId === category.id)
                    .map((item: MenuItem) => (
                      <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                              <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                              <div className="text-xl font-bold text-primary">
                                ${parseFloat(item.price).toFixed(2)}
                              </div>
                            </div>
                            {item.image && (
                              <div className="w-20 h-20 bg-gray-200 rounded-lg ml-4 flex-shrink-0">
                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                  🍽️
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge variant={item.isAvailable ? "default" : "secondary"}>
                              {item.isAvailable ? "Available" : "Unavailable"}
                            </Badge>
                            
                            {item.isAvailable && (
                              <Button 
                                onClick={() => addToCart(item)}
                                size="sm"
                                className="btn-primary"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add to Cart
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Menu Coming Soon</h3>
            <p className="text-gray-600">
              This restaurant is updating their menu. Please check back later.
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
