import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import NavigationHeader from "@/components/navigation-header";
import { 
  Store, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign, 
  TrendingUp,
  Star,
  Clock,
  AlertCircle
} from "lucide-react";
import type { Restaurant, MenuItem, Order } from "@shared/schema";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    
    if (!isLoading && user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin access required.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Fetch restaurants
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery({
    queryKey: ["admin-restaurants"],
    queryFn: async () => {
      const response = await fetch("/api/restaurants", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  // Fetch orders for selected restaurant
  const { data: orders = [] } = useQuery({
    queryKey: ["restaurant-orders", selectedRestaurant],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${selectedRestaurant}/orders`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    },
    enabled: !!selectedRestaurant && !!user?.isAdmin,
  });

  // Fetch restaurant stats
  const { data: stats } = useQuery({
    queryKey: ["/api/restaurants", selectedRestaurant, "stats"],
    enabled: !!selectedRestaurant && !!user?.isAdmin,
  });

  // Create restaurant mutation
  const createRestaurantMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/restaurants", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast({
        title: "Success",
        description: "Restaurant created successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create restaurant",
        variant: "destructive",
      });
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", selectedRestaurant, "orders"] });
      toast({
        title: "Success",
        description: "Order status updated!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const [restaurantForm, setRestaurantForm] = useState({
    name: "",
    description: "",
    cuisine: "",
    deliveryTime: "",
    deliveryFee: "",
    minimumOrder: "",
    address: "",
    phone: "",
  });

  const handleCreateRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    createRestaurantMutation.mutate({
      ...restaurantForm,
      deliveryFee: parseFloat(restaurantForm.deliveryFee),
      minimumOrder: parseFloat(restaurantForm.minimumOrder),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required to access this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <title>Admin Dashboard - West Row Kitchen</title>
      
      <NavigationHeader 
        isCartOpen={false}
        setIsCartOpen={() => {}}
        cartItemCount={0}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage restaurants, orders, and analytics</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Restaurant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Restaurant</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateRestaurant} className="space-y-4">
                <div>
                  <Label htmlFor="name">Restaurant Name</Label>
                  <Input 
                    id="name"
                    value={restaurantForm.name}
                    onChange={(e) => setRestaurantForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    value={restaurantForm.description}
                    onChange={(e) => setRestaurantForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cuisine">Cuisine Type</Label>
                  <Input 
                    id="cuisine"
                    value={restaurantForm.cuisine}
                    onChange={(e) => setRestaurantForm(prev => ({ ...prev, cuisine: e.target.value }))}
                    placeholder="e.g., Italian, Mexican, Asian"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deliveryTime">Delivery Time</Label>
                    <Input 
                      id="deliveryTime"
                      value={restaurantForm.deliveryTime}
                      onChange={(e) => setRestaurantForm(prev => ({ ...prev, deliveryTime: e.target.value }))}
                      placeholder="25-35 min"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryFee">Delivery Fee</Label>
                    <Input 
                      id="deliveryFee"
                      type="number"
                      step="0.01"
                      value={restaurantForm.deliveryFee}
                      onChange={(e) => setRestaurantForm(prev => ({ ...prev, deliveryFee: e.target.value }))}
                      placeholder="2.99"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address"
                    value={restaurantForm.address}
                    onChange={(e) => setRestaurantForm(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone"
                    value={restaurantForm.phone}
                    onChange={(e) => setRestaurantForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full btn-primary"
                  disabled={createRestaurantMutation.isPending}
                >
                  {createRestaurantMutation.isPending ? "Creating..." : "Create Restaurant"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{restaurants.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {orders.filter((o: Order) => ['pending', 'preparing', 'ready'].includes(o.status)).length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats ? parseFloat(stats.totalRevenue).toFixed(2) : "0.00"}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {restaurants.length > 0 
                      ? (restaurants.reduce((sum: number, r: Restaurant) => sum + parseFloat(r.rating || "0"), 0) / restaurants.length).toFixed(1)
                      : "0.0"
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-gray-500">No recent orders</p>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order: Order) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Order #{order.id.slice(-8)}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(order.createdAt!).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${parseFloat(order.totalAmount).toFixed(2)}</div>
                          <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restaurants">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant: Restaurant) => (
                <Card key={restaurant.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                      <Badge variant={restaurant.isOpen ? "default" : "destructive"}>
                        {restaurant.isOpen ? "Open" : "Closed"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{restaurant.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Cuisine:</span>
                        <span className="font-medium">{restaurant.cuisine}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rating:</span>
                        <span className="font-medium flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                          {restaurant.rating} ({restaurant.reviewCount})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery:</span>
                        <span className="font-medium">${restaurant.deliveryFee}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedRestaurant(restaurant.id)}>
                        View Orders
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant: Restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedRestaurant ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Orders for {restaurants.find((r: Restaurant) => r.id === selectedRestaurant)?.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <p className="text-gray-500">No orders for this restaurant</p>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order: Order) => (
                          <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-semibold">Order #{order.id.slice(-8)}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(order.createdAt!).toLocaleString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg">${parseFloat(order.totalAmount).toFixed(2)}</div>
                                <Select 
                                  value={order.status}
                                  onValueChange={(status) => updateOrderStatusMutation.mutate({ orderId: order.id, status })}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="preparing">Preparing</SelectItem>
                                    <SelectItem value="ready">Ready</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div>Delivery Address: {order.deliveryAddress}</div>
                              {order.deliveryInstructions && (
                                <div>Instructions: {order.deliveryInstructions}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Select a Restaurant</h3>
                    <p className="text-gray-600">Choose a restaurant from the dropdown to view its orders.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            {selectedRestaurant && stats ? (
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalOrders}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">${parseFloat(stats.totalRevenue).toFixed(2)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Average Order Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">${parseFloat(stats.averageOrderValue).toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Restaurant</h3>
                  <p className="text-gray-600">Choose a restaurant to view detailed analytics.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
