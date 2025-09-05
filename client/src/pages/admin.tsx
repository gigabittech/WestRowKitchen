import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Package,
  Tag,
  Settings,
  ShoppingCart,
  Calendar,
  ChevronDown,
  Activity
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Restaurant, MenuItem, Order, User, Coupon, MenuCategory } from "@shared/schema";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // State management
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean; id: string; type: string; name: string}>({
    open: false, id: "", type: "", name: ""
  });
  
  // Form states
  const [restaurantForm, setRestaurantForm] = useState({
    name: "", description: "", cuisine: "", deliveryTime: "", deliveryFee: "", 
    minimumOrder: "", address: "", phone: "", image: ""
  });
  
  const [couponForm, setCouponForm] = useState({
    code: "", title: "", description: "", discountType: "percentage" as const,
    discountValue: "", minimumOrder: "", maxUsage: "", userLimit: "",
    startDate: "", endDate: "", restaurantId: "", isActive: true
  });

  // Dialog states
  const [restaurantDialog, setRestaurantDialog] = useState({open: false, mode: "create" as "create" | "edit", data: null as Restaurant | null});
  const [couponDialog, setCouponDialog] = useState({open: false, mode: "create" as "create" | "edit", data: null as Coupon | null});

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
        setLocation("/");
      }, 1000);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Data fetching
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery({
    queryKey: ["admin-restaurants"],
    queryFn: async () => {
      const response = await fetch("/api/restaurants", { credentials: "include" });
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  const { data: allOrders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const response = await fetch("/api/admin/orders", { credentials: "include" });
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", { credentials: "include" });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  const { data: coupons = [] } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const response = await fetch("/api/admin/coupons", { credentials: "include" });
      if (!response.ok) throw new Error('Failed to fetch coupons');
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ["admin-menu-items", selectedRestaurant],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${selectedRestaurant}/menu`, { credentials: "include" });
      if (!response.ok) throw new Error('Failed to fetch menu items');
      return response.json();
    },
    enabled: !!selectedRestaurant && !!user?.isAdmin,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories", selectedRestaurant],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${selectedRestaurant}/categories`, { credentials: "include" });
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
    enabled: !!selectedRestaurant && !!user?.isAdmin,
  });

  // Statistics calculation
  const stats = {
    totalRestaurants: restaurants.length,
    totalOrders: allOrders.length,
    totalRevenue: allOrders.reduce((sum: number, order: Order) => sum + parseFloat(order.totalAmount), 0),
    activeOrders: allOrders.filter((order: Order) => ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)).length,
    totalUsers: users.length,
    activeCoupons: coupons.filter((coupon: Coupon) => coupon.isActive).length
  };

  // Mutations
  const createRestaurantMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/restaurants", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
      setRestaurantDialog({open: false, mode: "create", data: null});
      setRestaurantForm({name: "", description: "", cuisine: "", deliveryTime: "", deliveryFee: "", minimumOrder: "", address: "", phone: "", image: ""});
      toast({ title: "Success", description: "Restaurant created successfully!" });
    },
    onError: handleMutationError,
  });

  const updateRestaurantMutation = useMutation({
    mutationFn: async ({id, data}: {id: string, data: any}) => {
      const response = await apiRequest("PUT", `/api/restaurants/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
      setRestaurantDialog({open: false, mode: "create", data: null});
      toast({ title: "Success", description: "Restaurant updated successfully!" });
    },
    onError: handleMutationError,
  });

  const deleteRestaurantMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/restaurants/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
      setDeleteDialog({open: false, id: "", type: "", name: ""});
      toast({ title: "Success", description: "Restaurant deleted successfully!" });
    },
    onError: handleMutationError,
  });

  const createCouponMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/coupons", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      setCouponDialog({open: false, mode: "create", data: null});
      setCouponForm({code: "", title: "", description: "", discountType: "percentage", discountValue: "", minimumOrder: "", maxUsage: "", userLimit: "", startDate: "", endDate: "", restaurantId: "", isActive: true});
      toast({ title: "Success", description: "Coupon created successfully!" });
    },
    onError: handleMutationError,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "Success", description: "Order status updated!" });
    },
    onError: handleMutationError,
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${userId}`, { isAdmin });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Success", description: "User role updated!" });
    },
    onError: handleMutationError,
  });

  function handleMutationError(error: any) {
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
      description: "An error occurred. Please try again.",
      variant: "destructive",
    });
  }

  // Event handlers
  const handleRestaurantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...restaurantForm,
      deliveryFee: parseFloat(restaurantForm.deliveryFee),
      minimumOrder: parseFloat(restaurantForm.minimumOrder),
    };
    
    if (restaurantDialog.mode === "edit" && restaurantDialog.data) {
      updateRestaurantMutation.mutate({id: restaurantDialog.data.id, data});
    } else {
      createRestaurantMutation.mutate(data);
    }
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...couponForm,
      discountValue: parseFloat(couponForm.discountValue),
      minimumOrder: couponForm.minimumOrder ? parseFloat(couponForm.minimumOrder) : undefined,
      maxUsage: couponForm.maxUsage ? parseInt(couponForm.maxUsage) : undefined,
      userLimit: couponForm.userLimit ? parseInt(couponForm.userLimit) : undefined,
      restaurantId: couponForm.restaurantId || undefined,
    };
    
    createCouponMutation.mutate(data);
  };

  const openEditRestaurant = (restaurant: Restaurant) => {
    setRestaurantForm({
      name: restaurant.name,
      description: restaurant.description || "",
      cuisine: restaurant.cuisine,
      deliveryTime: restaurant.deliveryTime || "",
      deliveryFee: restaurant.deliveryFee || "",
      minimumOrder: restaurant.minimumOrder || "",
      address: restaurant.address || "",
      phone: restaurant.phone || "",
      image: restaurant.image || ""
    });
    setRestaurantDialog({open: true, mode: "edit", data: restaurant});
  };

  const openDeleteDialog = (id: string, type: string, name: string) => {
    setDeleteDialog({open: true, id, type, name});
  };

  const confirmDelete = () => {
    if (deleteDialog.type === "restaurant") {
      deleteRestaurantMutation.mutate(deleteDialog.id);
    }
  };

  // Filter functions
  const filteredOrders = allOrders.filter((order: Order) => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      
      <NavigationHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Comprehensive platform management</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setRestaurantDialog({open: true, mode: "create", data: null})}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-add-restaurant"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Restaurant
            </Button>
            <Button 
              onClick={() => setCouponDialog({open: true, mode: "create", data: null})}
              variant="outline"
              data-testid="button-add-coupon"
            >
              <Tag className="w-4 h-4 mr-2" />
              Add Coupon
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-restaurants">{stats.totalRestaurants}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-orders">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-active-orders">{stats.activeOrders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-revenue">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-users">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-coupons">{stats.activeCoupons}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-max min-w-full justify-start">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="restaurants" data-testid="tab-restaurants">Restaurants</TabsTrigger>
              <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
              <TabsTrigger value="coupons" data-testid="tab-coupons">Coupons</TabsTrigger>
              <TabsTrigger value="menu" data-testid="tab-menu">Menu Items</TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {allOrders.length === 0 ? (
                    <p className="text-gray-500">No recent orders</p>
                  ) : (
                    <div className="space-y-4">
                      {allOrders.slice(0, 5).map((order: Order) => (
                        <div key={order.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Order #{order.id.slice(-8)}</div>
                            <div className="text-sm text-gray-500">{order.customerName}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">${parseFloat(order.totalAmount).toFixed(2)}</div>
                            <Badge variant={order.status === 'delivered' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'secondary'}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Restaurants</CardTitle>
                </CardHeader>
                <CardContent>
                  {restaurants.length === 0 ? (
                    <p className="text-gray-500">No restaurants available</p>
                  ) : (
                    <div className="space-y-4">
                      {restaurants.slice(0, 5).map((restaurant: Restaurant) => (
                        <div key={restaurant.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{restaurant.name}</div>
                            <div className="text-sm text-gray-500">{restaurant.cuisine}</div>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span>{restaurant.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Restaurants Management */}
          <TabsContent value="restaurants">
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {restaurants.map((restaurant: Restaurant) => (
                    <Card key={restaurant.id} className="hover:shadow-md transition-shadow" data-testid={`restaurant-card-${restaurant.id}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => openEditRestaurant(restaurant)}
                              data-testid={`button-edit-restaurant-${restaurant.id}`}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openDeleteDialog(restaurant.id, "restaurant", restaurant.name)}
                              data-testid={`button-delete-restaurant-${restaurant.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Cuisine:</span>
                            <Badge variant="secondary">{restaurant.cuisine}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Rating:</span>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                              {restaurant.rating}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge variant={restaurant.isOpen ? "default" : "destructive"}>
                              {restaurant.isOpen ? "Open" : "Closed"}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery Fee:</span>
                            <span>${restaurant.deliveryFee}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Management */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Management</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                        data-testid="input-search-orders"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32" data-testid="select-order-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
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
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order: Order) => {
                      const restaurant = restaurants.find((r: Restaurant) => r.id === order.restaurantId);
                      return (
                        <TableRow key={order.id} data-testid={`order-row-${order.id}`}>
                          <TableCell className="font-mono">#{order.id.slice(-8)}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{restaurant?.name || "Unknown"}</TableCell>
                          <TableCell>${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                          <TableCell>
                            <Select 
                              value={order.status}
                              onValueChange={(status) => updateOrderStatusMutation.mutate({ orderId: order.id, status })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue>
                                  <Badge variant={order.status === 'cancelled' ? 'destructive' : order.status === 'delivered' ? 'default' : 'secondary'}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </Badge>
                                </SelectValue>
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
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt!).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setLocation(`/orders/${order.id}`)}
                              data-testid={`button-view-order-${order.id}`}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coupons Management */}
          <TabsContent value="coupons">
            <Card>
              <CardHeader>
                <CardTitle>Coupon Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valid Until</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon: Coupon) => {
                      const restaurant = restaurants.find((r: Restaurant) => r.id === coupon.restaurantId);
                      return (
                        <TableRow key={coupon.id} data-testid={`coupon-row-${coupon.id}`}>
                          <TableCell className="font-mono">{coupon.code}</TableCell>
                          <TableCell>{coupon.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {coupon.discountType === "percentage" ? "%" : 
                               coupon.discountType === "fixed" ? "$" : "Free Delivery"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {coupon.discountType === "percentage" 
                              ? `${coupon.discountValue}%`
                              : coupon.discountType === "fixed" 
                                ? `$${coupon.discountValue}`
                                : "Free"
                            }
                          </TableCell>
                          <TableCell>{restaurant?.name || "Platform-wide"}</TableCell>
                          <TableCell>
                            {coupon.currentUsage || 0}
                            {coupon.maxUsage ? `/${coupon.maxUsage}` : ""}
                          </TableCell>
                          <TableCell>
                            <Badge variant={coupon.isActive ? "default" : "destructive"}>
                              {coupon.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(coupon.endDate).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Items Management */}
          <TabsContent value="menu">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Menu Items Management</CardTitle>
                  <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                    <SelectTrigger className="w-64" data-testid="select-restaurant-menu">
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
              </CardHeader>
              <CardContent>
                {selectedRestaurant ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menuItems.map((item: MenuItem) => (
                      <Card key={item.id} data-testid={`menu-item-${item.id}`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{item.name}</h3>
                            <Badge variant={item.isAvailable ? "default" : "secondary"}>
                              {item.isAvailable ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-primary">${parseFloat(item.price).toFixed(2)}</span>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Select a Restaurant</h3>
                    <p className="text-gray-600">Choose a restaurant to view and manage its menu items.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Admin Access</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: User) => (
                      <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                        <TableCell>{user.firstName} {user.lastName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={user.isAdmin ? "default" : "secondary"}>
                            {user.isAdmin ? "Admin" : "Customer"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt!).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.isAdmin || false}
                              onCheckedChange={(checked) => 
                                updateUserRoleMutation.mutate({ userId: user.id, isAdmin: checked })
                              }
                              data-testid={`switch-user-role-${user.id}`}
                            />
                            <span className="text-sm text-muted-foreground">
                              {user.isAdmin ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Restaurant Dialog */}
      <Dialog open={restaurantDialog.open} onOpenChange={(open) => setRestaurantDialog({...restaurantDialog, open})}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {restaurantDialog.mode === "edit" ? "Edit Restaurant" : "Add New Restaurant"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRestaurantSubmit} className="grid grid-cols-2 gap-4">
            <div className="space-y-4 col-span-2">
              <div>
                <Label htmlFor="name">Restaurant Name</Label>
                <Input 
                  id="name"
                  value={restaurantForm.name}
                  onChange={(e) => setRestaurantForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  data-testid="input-restaurant-name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  value={restaurantForm.description}
                  onChange={(e) => setRestaurantForm(prev => ({ ...prev, description: e.target.value }))}
                  data-testid="input-restaurant-description"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="cuisine">Cuisine Type</Label>
              <Input 
                id="cuisine"
                value={restaurantForm.cuisine}
                onChange={(e) => setRestaurantForm(prev => ({ ...prev, cuisine: e.target.value }))}
                placeholder="e.g., Italian, Mexican, Asian"
                required
                data-testid="input-restaurant-cuisine"
              />
            </div>
            <div>
              <Label htmlFor="deliveryTime">Delivery Time</Label>
              <Input 
                id="deliveryTime"
                value={restaurantForm.deliveryTime}
                onChange={(e) => setRestaurantForm(prev => ({ ...prev, deliveryTime: e.target.value }))}
                placeholder="25-35 min"
                data-testid="input-restaurant-delivery-time"
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
                data-testid="input-restaurant-delivery-fee"
              />
            </div>
            <div>
              <Label htmlFor="minimumOrder">Minimum Order</Label>
              <Input 
                id="minimumOrder"
                type="number"
                step="0.01"
                value={restaurantForm.minimumOrder}
                onChange={(e) => setRestaurantForm(prev => ({ ...prev, minimumOrder: e.target.value }))}
                placeholder="15.00"
                data-testid="input-restaurant-minimum-order"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address"
                value={restaurantForm.address}
                onChange={(e) => setRestaurantForm(prev => ({ ...prev, address: e.target.value }))}
                data-testid="input-restaurant-address"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone"
                value={restaurantForm.phone}
                onChange={(e) => setRestaurantForm(prev => ({ ...prev, phone: e.target.value }))}
                data-testid="input-restaurant-phone"
              />
            </div>
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input 
                id="image"
                value={restaurantForm.image}
                onChange={(e) => setRestaurantForm(prev => ({ ...prev, image: e.target.value }))}
                data-testid="input-restaurant-image"
              />
            </div>
            <DialogFooter className="col-span-2">
              <Button type="button" variant="outline" onClick={() => setRestaurantDialog({...restaurantDialog, open: false})}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createRestaurantMutation.isPending || updateRestaurantMutation.isPending}
                data-testid="button-save-restaurant"
              >
                {(createRestaurantMutation.isPending || updateRestaurantMutation.isPending) ? "Saving..." : "Save Restaurant"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Coupon Dialog */}
      <Dialog open={couponDialog.open} onOpenChange={(open) => setCouponDialog({...couponDialog, open})}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCouponSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Coupon Code</Label>
              <Input 
                id="code"
                value={couponForm.code}
                onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="SAVE20"
                required
                data-testid="input-coupon-code"
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                value={couponForm.title}
                onChange={(e) => setCouponForm(prev => ({ ...prev, title: e.target.value }))}
                required
                data-testid="input-coupon-title"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={couponForm.description}
                onChange={(e) => setCouponForm(prev => ({ ...prev, description: e.target.value }))}
                data-testid="input-coupon-description"
              />
            </div>
            <div>
              <Label htmlFor="discountType">Discount Type</Label>
              <Select value={couponForm.discountType} onValueChange={(value: any) => setCouponForm(prev => ({ ...prev, discountType: value }))}>
                <SelectTrigger data-testid="select-coupon-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="free_delivery">Free Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="discountValue">Discount Value</Label>
              <Input 
                id="discountValue"
                type="number"
                step="0.01"
                value={couponForm.discountValue}
                onChange={(e) => setCouponForm(prev => ({ ...prev, discountValue: e.target.value }))}
                placeholder={couponForm.discountType === "percentage" ? "20" : "5.00"}
                required={couponForm.discountType !== "free_delivery"}
                disabled={couponForm.discountType === "free_delivery"}
                data-testid="input-coupon-value"
              />
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input 
                id="startDate"
                type="datetime-local"
                value={couponForm.startDate}
                onChange={(e) => setCouponForm(prev => ({ ...prev, startDate: e.target.value }))}
                required
                data-testid="input-coupon-start-date"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input 
                id="endDate"
                type="datetime-local"
                value={couponForm.endDate}
                onChange={(e) => setCouponForm(prev => ({ ...prev, endDate: e.target.value }))}
                required
                data-testid="input-coupon-end-date"
              />
            </div>
            <div>
              <Label htmlFor="restaurantId">Restaurant (Optional)</Label>
              <Select value={couponForm.restaurantId} onValueChange={(value) => setCouponForm(prev => ({ ...prev, restaurantId: value }))}>
                <SelectTrigger data-testid="select-coupon-restaurant">
                  <SelectValue placeholder="Platform-wide" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Platform-wide</SelectItem>
                  {restaurants.map((restaurant: Restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="minimumOrder">Minimum Order</Label>
              <Input 
                id="minimumOrder"
                type="number"
                step="0.01"
                value={couponForm.minimumOrder}
                onChange={(e) => setCouponForm(prev => ({ ...prev, minimumOrder: e.target.value }))}
                placeholder="25.00"
                data-testid="input-coupon-minimum-order"
              />
            </div>
            <div>
              <Label htmlFor="maxUsage">Max Usage (Optional)</Label>
              <Input 
                id="maxUsage"
                type="number"
                value={couponForm.maxUsage}
                onChange={(e) => setCouponForm(prev => ({ ...prev, maxUsage: e.target.value }))}
                placeholder="100"
                data-testid="input-coupon-max-usage"
              />
            </div>
            <div>
              <Label htmlFor="userLimit">Per User Limit (Optional)</Label>
              <Input 
                id="userLimit"
                type="number"
                value={couponForm.userLimit}
                onChange={(e) => setCouponForm(prev => ({ ...prev, userLimit: e.target.value }))}
                placeholder="1"
                data-testid="input-coupon-user-limit"
              />
            </div>
            <DialogFooter className="col-span-2">
              <Button type="button" variant="outline" onClick={() => setCouponDialog({...couponDialog, open: false})}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createCouponMutation.isPending}
                data-testid="button-save-coupon"
              >
                {createCouponMutation.isPending ? "Creating..." : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({...deleteDialog, open})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteDialog.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}