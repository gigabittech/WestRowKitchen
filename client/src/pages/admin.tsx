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
  Activity,
  Truck,
  MapPin,
  ImageIcon,
  CheckCircle,
  XCircle
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
import { LogoUploader } from "@/components/LogoUploader";
import { MenuItemImageUploader } from "@/components/MenuItemImageUploader";
import { useRestaurantsStatus } from "@/hooks/useRestaurantStatus";
import type { Restaurant, MenuItem, Order, User, Coupon, MenuCategory } from "@shared/schema";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean; id: string; type: string; name: string}>({
    open: false, id: "", type: "", name: ""
  });
  
  // Helper function to get default restaurant form
  const getDefaultRestaurantForm = () => ({
    name: "", description: "", cuisine: "", deliveryTime: "", deliveryFee: "", 
    minimumOrder: "", address: "", phone: "", image: "", rating: "", reviewCount: "",
    isOpen: true, // Restaurant open/closed status
    isTemporarilyClosed: false, // Temporary closure status
    timezone: "America/New_York", // Restaurant timezone
    operatingHoursMode: "default" as "default" | "advanced",
    defaultOpen: "09:00", defaultClose: "21:00",
    operatingHours: {
      monday: { open: "09:00", close: "21:00", closed: false },
      tuesday: { open: "09:00", close: "21:00", closed: false },
      wednesday: { open: "09:00", close: "21:00", closed: false },
      thursday: { open: "09:00", close: "21:00", closed: false },
      friday: { open: "09:00", close: "21:00", closed: false },
      saturday: { open: "09:00", close: "21:00", closed: false },
      sunday: { open: "09:00", close: "21:00", closed: false },
    }
  });

  // Form states
  const [restaurantForm, setRestaurantForm] = useState(getDefaultRestaurantForm());
  
  const [couponForm, setCouponForm] = useState({
    code: "", title: "", description: "", discountType: "percentage" as const,
    discountValue: "", minimumOrder: "", maxUsage: "", userLimit: "",
    startDate: "", endDate: "", restaurantId: "", isActive: true
  });

  const [menuItemForm, setMenuItemForm] = useState({
    name: "", description: "", price: "", categoryId: "", preparationTime: "", image: "", isAvailable: true
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "", description: "", displayOrder: ""
  });

  // Dialog states
  const [restaurantDialog, setRestaurantDialog] = useState({open: false, mode: "create" as "create" | "edit", data: null as Restaurant | null});
  const [couponDialog, setCouponDialog] = useState({open: false, mode: "create" as "create" | "edit", data: null as Coupon | null});
  const [menuItemDialog, setMenuItemDialog] = useState({open: false, mode: "create" as "create" | "edit", data: null as MenuItem | null});
  const [categoryDialog, setCategoryDialog] = useState({open: false, mode: "create" as "create" | "edit", data: null as MenuCategory | null});

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
    queryKey: ["/api/restaurants"],
    enabled: !!user?.isAdmin,
  });

  const { data: allOrders = [] } = useQuery({
    queryKey: ["/api/admin/orders"],
    enabled: !!user?.isAdmin,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  const { data: coupons = [] } = useQuery({
    queryKey: ["/api/admin/coupons"],
    enabled: !!user?.isAdmin,
  });

  // Get real-time status for all restaurants in admin
  const restaurantStatuses = useRestaurantsStatus(restaurants);

  const { data: menuItems = [] } = useQuery({
    queryKey: [`/api/restaurants/${selectedRestaurant}/menu`],
    enabled: !!selectedRestaurant && !!user?.isAdmin,
  });

  const { data: categories = [] } = useQuery({
    queryKey: [`/api/restaurants/${selectedRestaurant}/categories`],
    enabled: !!selectedRestaurant && !!user?.isAdmin,
  });

  // Trash data queries
  const { data: deletedRestaurants = [] } = useQuery({
    queryKey: ["/api/admin/trash/restaurants"],
    enabled: !!user?.isAdmin && activeTab === "trash",
  });

  const { data: deletedCategories = [] } = useQuery({
    queryKey: ["/api/admin/trash/categories"],
    enabled: !!user?.isAdmin && activeTab === "trash",
  });

  const { data: deletedMenuItems = [] } = useQuery({
    queryKey: ["/api/admin/trash/items"],
    enabled: !!user?.isAdmin && activeTab === "trash",
  });

  const { data: deletedCoupons = [] } = useQuery({
    queryKey: ["/api/admin/trash/coupons"],
    enabled: !!user?.isAdmin && activeTab === "trash",
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
      // Invalidate all restaurant-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/search"] });
      queryClient.refetchQueries({ queryKey: ["/api/restaurants"] });
      setRestaurantDialog({open: false, mode: "create", data: null});
      setRestaurantForm(getDefaultRestaurantForm());
      toast({ title: "Success", description: "Restaurant created successfully!" });
    },
    onError: handleMutationError,
  });

  const updateRestaurantMutation = useMutation({
    mutationFn: async ({id, data}: {id: string, data: any}) => {
      const response = await apiRequest("PUT", `/api/restaurants/${id}`, data);
      return response.json();
    },
    onSuccess: (updatedRestaurant) => {
      console.log("Restaurant updated successfully:", updatedRestaurant);
      // Invalidate all restaurant-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/search"] });
      queryClient.refetchQueries({ queryKey: ["/api/restaurants"] });
      setRestaurantDialog({open: false, mode: "create", data: null});
      setRestaurantForm(getDefaultRestaurantForm());
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
      // Invalidate all restaurant-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/search"] });
      queryClient.refetchQueries({ queryKey: ["/api/restaurants"] });
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
      // Invalidate coupon queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/coupons"] });
      setCouponDialog({open: false, mode: "create", data: null});
      setCouponForm({code: "", title: "", description: "", discountType: "percentage", discountValue: "", minimumOrder: "", maxUsage: "", userLimit: "", startDate: "", endDate: "", restaurantId: "", isActive: true});
      toast({ title: "Success", description: "Coupon created successfully!" });
    },
    onError: handleMutationError,
  });

  const updateCouponMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/admin/coupons/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate coupon queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/coupons"] });
      setCouponDialog({open: false, mode: "create", data: null});
      setCouponForm({code: "", title: "", description: "", discountType: "percentage", discountValue: "", minimumOrder: "", maxUsage: "", userLimit: "", startDate: "", endDate: "", restaurantId: "", isActive: true});
      toast({ title: "Success", description: "Coupon updated successfully!" });
    },
    onError: handleMutationError,
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/coupons/${id}`);
    },
    onSuccess: () => {
      // Invalidate coupon queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/coupons"] });
      setDeleteDialog({open: false, id: "", type: "", name: ""});
      toast({ title: "Success", description: "Coupon deleted successfully!" });
    },
    onError: handleMutationError,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all order-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.refetchQueries({ queryKey: ["/api/orders"] });
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
      // Invalidate all user-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User role updated!" });
    },
    onError: handleMutationError,
  });

  // Restaurant status toggle mutation
  const toggleRestaurantStatusMutation = useMutation({
    mutationFn: async ({ restaurantId, isOpen }: { restaurantId: string; isOpen: boolean }) => {
      const response = await apiRequest("PUT", `/api/restaurants/${restaurantId}/status`, { isOpen });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all restaurant-related queries 
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/search"] });
      queryClient.refetchQueries({ queryKey: ["/api/restaurants"] });
      toast({ title: "Success", description: "Restaurant status updated!" });
    },
    onError: handleMutationError,
  });

  // Toggle restaurant status function
  const toggleRestaurantStatus = (restaurantId: string, isOpen: boolean) => {
    toggleRestaurantStatusMutation.mutate({ restaurantId, isOpen });
  };

  const createMenuItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/restaurants/${selectedRestaurant}/menu`, data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate menu and search queries
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/menu`] });
      queryClient.invalidateQueries({ queryKey: ["/api/search"] });
      queryClient.refetchQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/menu`] });
      setMenuItemDialog({open: false, mode: "create", data: null});
      setMenuItemForm({name: "", description: "", price: "", categoryId: "", preparationTime: "", image: "", isAvailable: true});
      toast({ title: "Success", description: "Menu item created successfully!" });
    },
    onError: handleMutationError,
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/menu-items/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate menu and search queries
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/menu`] });
      queryClient.invalidateQueries({ queryKey: ["/api/search"] });
      queryClient.refetchQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/menu`] });
      setMenuItemDialog({open: false, mode: "create", data: null});
      setMenuItemForm({name: "", description: "", price: "", categoryId: "", preparationTime: "", image: "", isAvailable: true});
      toast({ title: "Success", description: "Menu item updated successfully!" });
    },
    onError: handleMutationError,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/restaurants/${selectedRestaurant}/categories`, data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate categories and menu queries
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/categories`] });
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/menu`] });
      queryClient.refetchQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/categories`] });
      setCategoryDialog({open: false, mode: "create", data: null});
      setCategoryForm({name: "", description: "", displayOrder: ""});
      toast({ title: "Success", description: "Category created successfully!" });
    },
    onError: handleMutationError,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/categories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate categories and menu queries
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/categories`] });
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/menu`] });
      queryClient.refetchQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/categories`] });
      setCategoryDialog({open: false, mode: "create", data: null});
      setCategoryForm({name: "", description: "", displayOrder: ""});
      toast({ title: "Success", description: "Category updated successfully!" });
    },
    onError: handleMutationError,
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      // Invalidate categories and menu queries
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/categories`] });
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/menu`] });
      queryClient.refetchQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/categories`] });
      setDeleteDialog({open: false, id: "", type: "", name: ""});
      toast({ title: "Success", description: "Category deleted successfully!" });
    },
    onError: handleMutationError,
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/menu-items/${id}`);
    },
    onSuccess: () => {
      // Invalidate menu and search queries
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/menu`] });
      queryClient.invalidateQueries({ queryKey: ["/api/search"] });
      queryClient.refetchQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/menu`] });
      setDeleteDialog({open: false, id: "", type: "", name: ""});
      toast({ title: "Success", description: "Menu item deleted successfully!" });
    },
    onError: handleMutationError,
  });

  // Restore mutations for trash functionality
  const restoreRestaurantMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PUT", `/api/admin/trash/restaurants/${id}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trash/restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast({ title: "Success", description: "Restaurant restored successfully!" });
    },
    onError: handleMutationError,
  });

  const restoreCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PUT", `/api/admin/trash/categories/${id}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trash/categories"] });
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/categories`] });
      toast({ title: "Success", description: "Category restored successfully!" });
    },
    onError: handleMutationError,
  });

  const restoreMenuItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PUT", `/api/admin/trash/items/${id}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trash/items"] });
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/menu`] });
      toast({ title: "Success", description: "Menu item restored successfully!" });
    },
    onError: handleMutationError,
  });

  const restoreCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PUT", `/api/admin/trash/coupons/${id}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trash/coupons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "Success", description: "Coupon restored successfully!" });
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
    
    // Enhanced validation
    if (!restaurantForm.name.trim()) {
      toast({ title: "Error", description: "Restaurant name is required", variant: "destructive" });
      return;
    }
    
    if (restaurantForm.name.trim().length < 2) {
      toast({ title: "Error", description: "Restaurant name must be at least 2 characters", variant: "destructive" });
      return;
    }
    
    if (!restaurantForm.cuisine.trim()) {
      toast({ title: "Error", description: "Cuisine type is required", variant: "destructive" });
      return;
    }
    
    // Validate delivery fee if provided
    if (restaurantForm.deliveryFee && (parseFloat(restaurantForm.deliveryFee) < 0 || parseFloat(restaurantForm.deliveryFee) > 50)) {
      toast({ title: "Error", description: "Delivery fee must be between $0 and $50", variant: "destructive" });
      return;
    }
    
    // Validate minimum order if provided
    if (restaurantForm.minimumOrder && (parseFloat(restaurantForm.minimumOrder) < 0 || parseFloat(restaurantForm.minimumOrder) > 100)) {
      toast({ title: "Error", description: "Minimum order must be between $0 and $100", variant: "destructive" });
      return;
    }
    
    // Validate phone number format if provided
    if (restaurantForm.phone && restaurantForm.phone.trim() && !/^[\d\s\(\)\-\+\.]+$/.test(restaurantForm.phone)) {
      toast({ title: "Error", description: "Please enter a valid phone number", variant: "destructive" });
      return;
    }
    
    const data = {
      name: restaurantForm.name.trim(),
      description: restaurantForm.description.trim(),
      cuisine: restaurantForm.cuisine.trim(),
      deliveryTime: restaurantForm.deliveryTime.trim(),
      address: restaurantForm.address.trim(),
      phone: restaurantForm.phone.trim(),
      image: restaurantForm.image,
      deliveryFee: restaurantForm.deliveryFee ? parseFloat(restaurantForm.deliveryFee) : 0,
      minimumOrder: restaurantForm.minimumOrder ? parseFloat(restaurantForm.minimumOrder) : 0,
      rating: restaurantForm.rating ? parseFloat(restaurantForm.rating) : 0,
      reviewCount: restaurantForm.reviewCount ? parseInt(restaurantForm.reviewCount) : 0,
      operatingHours: restaurantForm.operatingHours,
      isOpen: restaurantForm.isOpen,
      isTemporarilyClosed: restaurantForm.isTemporarilyClosed,
      timezone: restaurantForm.timezone,
    };
    
    if (restaurantDialog.mode === "edit" && restaurantDialog.data) {
      updateRestaurantMutation.mutate({ id: restaurantDialog.data.id, data });
    } else {
      createRestaurantMutation.mutate(data);
    }
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...couponForm,
      discountValue: couponForm.discountValue,
      minimumOrder: couponForm.minimumOrder || undefined,
      maxUsage: couponForm.maxUsage ? parseInt(couponForm.maxUsage) : undefined,
      userLimit: couponForm.userLimit ? parseInt(couponForm.userLimit) : undefined,
      startDate: new Date(couponForm.startDate).toISOString(),
      endDate: new Date(couponForm.endDate).toISOString(),
      restaurantId: couponForm.restaurantId || undefined,
    };
    
    if (couponDialog.mode === "edit" && couponDialog.data) {
      updateCouponMutation.mutate({ id: couponDialog.data.id, data });
    } else {
      createCouponMutation.mutate(data);
    }
  };

  const openEditCoupon = (coupon: Coupon) => {
    setCouponForm({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minimumOrder: coupon.minimumOrder?.toString() || "",
      maxUsage: coupon.maxUsage?.toString() || "",
      userLimit: coupon.userLimit?.toString() || "",
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : "",
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 16) : "",
      restaurantId: coupon.restaurantId || "",
      isActive: coupon.isActive
    });
    setCouponDialog({open: true, mode: "edit", data: coupon});
  };

  const handleMenuItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...menuItemForm,
      price: menuItemForm.price, // Keep as string for validation
      preparationTime: menuItemForm.preparationTime ? parseInt(menuItemForm.preparationTime) : undefined,
    };
    
    if (menuItemDialog.mode === "edit" && menuItemDialog.data) {
      updateMenuItemMutation.mutate({ id: menuItemDialog.data.id, data });
    } else {
      createMenuItemMutation.mutate(data);
    }
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: categoryForm.name,
      description: categoryForm.description || null,
      sortOrder: categoryForm.displayOrder ? parseInt(categoryForm.displayOrder) : null,
      restaurantId: selectedRestaurant,
    };
    
    if (categoryDialog.mode === "edit" && categoryDialog.data) {
      updateCategoryMutation.mutate({ id: categoryDialog.data.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const openEditRestaurant = (restaurant: Restaurant) => {
    // Get existing operating hours or use default structure
    const existingHours = restaurant.operatingHours || {
      monday: { open: "09:00", close: "21:00", closed: false },
      tuesday: { open: "09:00", close: "21:00", closed: false },
      wednesday: { open: "09:00", close: "21:00", closed: false },
      thursday: { open: "09:00", close: "21:00", closed: false },
      friday: { open: "09:00", close: "21:00", closed: false },
      saturday: { open: "09:00", close: "21:00", closed: false },
      sunday: { open: "09:00", close: "21:00", closed: false }
    };

    setRestaurantForm({
      name: restaurant.name,
      description: restaurant.description || "",
      cuisine: restaurant.cuisine,
      deliveryTime: restaurant.deliveryTime || "",
      deliveryFee: restaurant.deliveryFee || "",
      minimumOrder: restaurant.minimumOrder || "",
      address: restaurant.address || "",
      phone: restaurant.phone || "",
      image: restaurant.image || "",
      rating: restaurant.rating?.toString() || "0",
      reviewCount: restaurant.reviewCount?.toString() || "0",
      isOpen: restaurant.isOpen ?? true, // Restaurant open/closed status
      isTemporarilyClosed: restaurant.isTemporarilyClosed ?? false, // Temporary closure status
      timezone: restaurant.timezone || "America/New_York", // Restaurant timezone
      operatingHoursMode: "advanced", // Always use advanced mode for editing existing restaurants
      defaultOpen: "09:00",
      defaultClose: "21:00", 
      operatingHours: existingHours
    });
    setRestaurantDialog({open: true, mode: "edit", data: restaurant});
  };

  const openDeleteDialog = (id: string, type: string, name: string) => {
    setDeleteDialog({open: true, id, type, name});
  };

  const confirmDelete = () => {
    if (deleteDialog.type === "restaurant") {
      deleteRestaurantMutation.mutate(deleteDialog.id);
    } else if (deleteDialog.type === "category") {
      deleteCategoryMutation.mutate(deleteDialog.id);
    } else if (deleteDialog.type === "menu-item") {
      deleteMenuItemMutation.mutate(deleteDialog.id);
    } else if (deleteDialog.type === "coupon") {
      deleteCouponMutation.mutate(deleteDialog.id);
    }
    setDeleteDialog({open: false, id: "", type: "", name: ""});
  };

  // Filter functions
  const filteredOrders = allOrders.filter((order: Order) => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  //console.log(allOrders)



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


  // Uber Eats integration function
    function handleConfirmed(order: Order) {
      fetch("http://localhost:5001/api/uber/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          customer: order.customerName,
          restaurantId: order.restaurantId,
          amount: order.totalAmount
        }),
      })
        .then(res => res.json())
        .then(data => console.log("Uber delivery response:", data))
        .catch(err => console.error("Failed to trigger Uber delivery:", err));
    }


  return (
    <div className="min-h-screen bg-background">
      <title>Admin Dashboard - West Row Kitchen</title>
      
      <NavigationHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm sm:text-base">Comprehensive platform management</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => {
                setRestaurantForm(getDefaultRestaurantForm());
                setRestaurantDialog({open: true, mode: "create", data: null});
              }}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-add-restaurant"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Restaurant</span>
              <span className="sm:hidden">Restaurant</span>
            </Button>
            <Button 
              onClick={() => setCouponDialog({open: true, mode: "create", data: null})}
              variant="outline"
              data-testid="button-add-coupon"
            >
              <Tag className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Coupon</span>
              <span className="sm:hidden">Coupon</span>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-max min-w-full justify-start">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="restaurants" data-testid="tab-restaurants">Restaurants</TabsTrigger>
              <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
              <TabsTrigger value="coupons" data-testid="tab-coupons">Coupons</TabsTrigger>
              <TabsTrigger value="menu" data-testid="tab-menu">Menu Items</TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
              <TabsTrigger value="trash" data-testid="tab-trash">🗑️ Trash</TabsTrigger>
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">Restaurant Management</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage your restaurant partners and their settings
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setRestaurantForm(getDefaultRestaurantForm());
                        setRestaurantDialog({open: true, mode: "create", data: null});
                      }}
                      className="bg-primary hover:bg-primary/90"
                      data-testid="button-add-restaurant-main"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Restaurant
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search restaurants by name, cuisine, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-restaurants"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-restaurant-status">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Restaurants</SelectItem>
                      <SelectItem value="open">Open Only</SelectItem>
                      <SelectItem value="closed">Closed Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Restaurant Grid */}
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {restaurants
                    .filter((restaurant: Restaurant) => {
                      const matchesSearch = searchTerm === "" || 
                        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (restaurant.address && restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()));
                      
                      const matchesStatus = statusFilter === "all" || 
                        (statusFilter === "open" && restaurant.isOpen) ||
                        (statusFilter === "closed" && !restaurant.isOpen);
                      
                      return matchesSearch && matchesStatus;
                    })
                    .map((restaurant: Restaurant) => (
                    <Card key={restaurant.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary" data-testid={`restaurant-card-${restaurant.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                              {restaurant.image ? (
                                <img
                                  src={restaurant.image.startsWith('/assets/') || restaurant.image.startsWith('http') ? restaurant.image : `/assets/${restaurant.image}`}
                                  alt={`${restaurant.name} logo`}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <Store className={`w-6 h-6 text-primary ${restaurant.image ? 'hidden' : ''}`} />
                            </div>
                            <div>
                              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                                {restaurant.name}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground flex items-center mt-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                {restaurant.address || "No address provided"}
                              </p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openEditRestaurant(restaurant)}
                                data-testid={`menu-edit-restaurant-${restaurant.id}`}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toggleRestaurantStatus(restaurant.id, !restaurant.isOpen)}
                                data-testid={`menu-toggle-restaurant-${restaurant.id}`}
                              >
                                {restaurant.isOpen ? (
                                  <>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Close Restaurant
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Open Restaurant
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(restaurant.id, "restaurant", restaurant.name)}
                                className="text-destructive focus:text-destructive"
                                data-testid={`menu-delete-restaurant-${restaurant.id}`}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Restaurant
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Restaurant Info Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Cuisine</span>
                              <Badge variant="secondary" className="text-xs">
                                {restaurant.cuisine}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Rating</span>
                              <div className="flex items-center">
                                <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                                <span className="text-sm font-medium">{restaurant.rating}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Status</span>
                              {(() => {
                                const status = restaurantStatuses.get(restaurant.id);
                                const isOpen = status?.isOpen || false;
                                
                                return (
                                  <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <Badge variant={isOpen ? "default" : "destructive"} className="text-xs">
                                      {restaurant.isTemporarilyClosed ? "Temp Closed" : isOpen ? "Open" : "Closed"}
                                    </Badge>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Delivery</span>
                              <span className="text-sm font-medium">${restaurant.deliveryFee}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Min Order</span>
                              <span className="text-sm font-medium">${restaurant.minimumOrder}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Delivery Time</span>
                              <span className="text-sm font-medium">{restaurant.deliveryTime || "N/A"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Restaurant Description */}
                        {restaurant.description && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {restaurant.description}
                            </p>
                          </div>
                        )}

                        {/* Contact Information */}
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Contact</span>
                            <span className="font-medium">
                              {restaurant.phone || "No phone provided"}
                            </span>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => openEditRestaurant(restaurant)}
                            data-testid={`button-quick-edit-${restaurant.id}`}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setSelectedRestaurant(restaurant.id);
                              setActiveTab("menu");
                            }}
                            data-testid={`button-view-menu-${restaurant.id}`}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Menu
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Empty State */}
                {restaurants.length === 0 && (
                  <div className="text-center py-12">
                    <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No restaurants yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Get started by adding your first restaurant partner
                    </p>
                    <Button
                      onClick={() => setRestaurantDialog({open: true, mode: "create", data: null})}
                      data-testid="button-add-first-restaurant"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Restaurant
                    </Button>
                  </div>
                )}

                {/* Filtered Empty State */}
                {restaurants.length > 0 && restaurants.filter((restaurant: Restaurant) => {
                  const matchesSearch = searchTerm === "" || 
                    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (restaurant.address && restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()));
                  
                  const matchesStatus = statusFilter === "all" || 
                    (statusFilter === "open" && restaurant.isOpen) ||
                    (statusFilter === "closed" && !restaurant.isOpen);
                  
                  return matchesSearch && matchesStatus;
                }).length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No restaurants found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search terms or filters
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Management */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3">
                  <CardTitle>Order Management</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-full sm:w-48"
                        data-testid="input-search-orders"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-32" data-testid="select-order-status">
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
                                onValueChange={(status) => {
                                  updateOrderStatusMutation.mutate({ orderId: order.id, status });

                                  // Call handleConfirmed only if status is set to "confirmed"
                                  if (status === "confirmed") {
                                    handleConfirmed(order);
                                  }
                                }}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue>
                                    <Badge
                                      variant={
                                        order.status === "cancelled"
                                          ? "destructive"
                                          : order.status === "delivered"
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
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
                <div className="flex items-center justify-between">
                  <CardTitle>Coupon Management</CardTitle>
                  <Button
                    onClick={() => setCouponDialog({open: true, mode: "create", data: null})}
                    data-testid="button-add-coupon-tab"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Coupon
                  </Button>
                </div>
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
                      <TableHead>Actions</TableHead>
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
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditCoupon(coupon)}
                                data-testid={`button-edit-coupon-${coupon.id}`}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openDeleteDialog(coupon.id, "coupon", coupon.code)}
                                data-testid={`button-delete-coupon-${coupon.id}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
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
                  <div className="flex items-center gap-2">
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
                    {selectedRestaurant && (
                      <Button
                        onClick={() => setMenuItemDialog({open: true, mode: "create", data: null})}
                        size="sm"
                        data-testid="button-add-menu-item"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedRestaurant ? (
                  <div className="space-y-6">
                    {/* Categories Management Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Tag className="w-5 h-5 text-primary" />
                          Menu Categories
                        </h3>
                        <Button
                          onClick={() => setCategoryDialog({open: true, mode: "create", data: null})}
                          size="sm"
                          variant="outline"
                          data-testid="button-add-category"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Category
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        {categories.map((category: MenuCategory) => (
                          <Card key={category.id} className="p-3" data-testid={`category-${category.id}`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{category.name}</h4>
                                {category.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setCategoryForm({
                                      name: category.name,
                                      description: category.description || "",
                                      displayOrder: category.sortOrder?.toString() || ""
                                    });
                                    setCategoryDialog({open: true, mode: "edit", data: category});
                                  }}
                                  data-testid={`button-edit-category-${category.id}`}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openDeleteDialog(category.id, "category", category.name)}
                                  data-testid={`button-delete-category-${category.id}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Menu Items Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        Menu Items
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {menuItems.map((item: MenuItem) => (
                      <Card key={item.id} data-testid={`menu-item-${item.id}`}>
                        <CardContent className="p-4">
                          {/* Menu Item Image */}
                          {item.image && (
                            <div className="mb-3">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-full h-32 object-cover rounded-md"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                                data-testid={`img-menu-item-${item.id}`}
                              />
                            </div>
                          )}
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
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setMenuItemForm({
                                    name: item.name,
                                    description: item.description || "",
                                    price: item.price,
                                    categoryId: item.categoryId,
                                    preparationTime: item.preparationTime?.toString() || "",
                                    image: item.image || "",
                                    isAvailable: item.isAvailable ?? true
                                  });
                                  setMenuItemDialog({open: true, mode: "edit", data: item});
                                }}
                                data-testid={`button-edit-menu-item-${item.id}`}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openDeleteDialog(item.id, "menu-item", item.name)}
                                data-testid={`button-delete-menu-item-${item.id}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                      </div>
                    </div>
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

          <TabsContent value="trash">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">🗑️ Trash</h2>
                  <p className="text-muted-foreground">
                    View and restore deleted items
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Deleted Restaurants</p>
                        <p className="text-2xl font-bold">{deletedRestaurants.length}</p>
                      </div>
                      <Store className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Deleted Categories</p>
                        <p className="text-2xl font-bold">{deletedCategories.length}</p>
                      </div>
                      <Tag className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Deleted Menu Items</p>
                        <p className="text-2xl font-bold">{deletedMenuItems.length}</p>
                      </div>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Deleted Coupons</p>
                        <p className="text-2xl font-bold">{deletedCoupons.length}</p>
                      </div>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="restaurants" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                  <TabsTrigger value="items">Menu Items</TabsTrigger>
                  <TabsTrigger value="coupons">Coupons</TabsTrigger>
                </TabsList>

                <TabsContent value="restaurants">
                  <Card>
                    <CardHeader>
                      <CardTitle>Deleted Restaurants</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {deletedRestaurants.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No deleted restaurants
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Cuisine</TableHead>
                              <TableHead>Rating</TableHead>
                              <TableHead>Deleted</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {deletedRestaurants.map((restaurant: Restaurant) => (
                              <TableRow key={restaurant.id}>
                                <TableCell className="font-medium">{restaurant.name}</TableCell>
                                <TableCell>{restaurant.cuisine}</TableCell>
                                <TableCell>⭐ {restaurant.rating}</TableCell>
                                <TableCell>
                                  {restaurant.updatedAt ? new Date(restaurant.updatedAt).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => restoreRestaurantMutation.mutate(restaurant.id)}
                                    disabled={restoreRestaurantMutation.isPending}
                                    data-testid={`restore-restaurant-${restaurant.id}`}
                                  >
                                    Restore
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="categories">
                  <Card>
                    <CardHeader>
                      <CardTitle>Deleted Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {deletedCategories.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No deleted categories
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Deleted</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {deletedCategories.map((category: MenuCategory) => (
                              <TableRow key={category.id}>
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell>{category.description || 'N/A'}</TableCell>
                                <TableCell>
                                  {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => restoreCategoryMutation.mutate(category.id)}
                                    disabled={restoreCategoryMutation.isPending}
                                    data-testid={`restore-category-${category.id}`}
                                  >
                                    Restore
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="items">
                  <Card>
                    <CardHeader>
                      <CardTitle>Deleted Menu Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {deletedMenuItems.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No deleted menu items
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Deleted</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {deletedMenuItems.map((item: MenuItem) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>${item.price}</TableCell>
                                <TableCell>{item.categoryId}</TableCell>
                                <TableCell>
                                  {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => restoreMenuItemMutation.mutate(item.id)}
                                    disabled={restoreMenuItemMutation.isPending}
                                    data-testid={`restore-item-${item.id}`}
                                  >
                                    Restore
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="coupons">
                  <Card>
                    <CardHeader>
                      <CardTitle>Deleted Coupons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {deletedCoupons.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No deleted coupons
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Code</TableHead>
                              <TableHead>Title</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead>Deleted</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {deletedCoupons.map((coupon: Coupon) => (
                              <TableRow key={coupon.id}>
                                <TableCell className="font-medium">{coupon.code}</TableCell>
                                <TableCell>{coupon.title}</TableCell>
                                <TableCell>{coupon.discountType}</TableCell>
                                <TableCell>
                                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                </TableCell>
                                <TableCell>
                                  {coupon.createdAt ? new Date(coupon.createdAt).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => restoreCouponMutation.mutate(coupon.id)}
                                    disabled={restoreCouponMutation.isPending}
                                    data-testid={`restore-coupon-${coupon.id}`}
                                  >
                                    Restore
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Restaurant Dialog */}
      <Dialog open={restaurantDialog.open} onOpenChange={(open) => {
        setRestaurantDialog({...restaurantDialog, open});
        if (!open) {
          // Reset form when dialog closes
          setRestaurantForm(getDefaultRestaurantForm());
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {restaurantDialog.mode === "edit" ? "Edit Restaurant" : "Create New Restaurant"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {restaurantDialog.mode === "edit" 
                ? "Update restaurant information and settings" 
                : "Fill in the details below to add a new restaurant to your platform"
              }
            </p>
          </DialogHeader>
          
          <form onSubmit={handleRestaurantSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Store className="w-4 h-4 text-primary" />
                <h3 className="font-medium">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Restaurant Name <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="name"
                    value={restaurantForm.name}
                    onChange={(e) => setRestaurantForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter restaurant name"
                    required
                    minLength={2}
                    maxLength={100}
                    data-testid="input-restaurant-name"
                    className="transition-colors focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    The name that customers will see (2-100 characters)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cuisine" className="text-sm font-medium">
                    Cuisine Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={restaurantForm.cuisine} onValueChange={(value) => setRestaurantForm(prev => ({ ...prev, cuisine: value }))}>
                    <SelectTrigger data-testid="select-restaurant-cuisine">
                      <SelectValue placeholder="Select cuisine type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Italian">Italian</SelectItem>
                      <SelectItem value="Mexican">Mexican</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Indian">Indian</SelectItem>
                      <SelectItem value="American">American</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                      <SelectItem value="Thai">Thai</SelectItem>
                      <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                      <SelectItem value="Fast Food">Fast Food</SelectItem>
                      <SelectItem value="Pizza">Pizza</SelectItem>
                      <SelectItem value="Seafood">Seafood</SelectItem>
                      <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Primary cuisine category for filtering
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea 
                  id="description"
                  value={restaurantForm.description}
                  onChange={(e) => setRestaurantForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your restaurant, specialties, and what makes it unique..."
                  rows={3}
                  maxLength={500}
                  data-testid="input-restaurant-description"
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Brief description that appears on your restaurant page (up to 500 characters)
                </p>
              </div>
            </div>

            {/* Delivery & Pricing Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Truck className="w-4 h-4 text-primary" />
                <h3 className="font-medium">Delivery & Pricing</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryTime" className="text-sm font-medium">
                    Estimated Delivery Time
                  </Label>
                  <Input 
                    id="deliveryTime"
                    value={restaurantForm.deliveryTime}
                    onChange={(e) => setRestaurantForm(prev => ({ ...prev, deliveryTime: e.target.value }))}
                    placeholder="25-35 min"
                    pattern="[0-9]+-[0-9]+ min"
                    data-testid="input-restaurant-delivery-time"
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: "25-35 min"
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deliveryFee" className="text-sm font-medium">
                    Delivery Fee ($)
                  </Label>
                  <Input 
                    id="deliveryFee"
                    type="number"
                    step="0.01"
                    min="0"
                    max="50"
                    value={restaurantForm.deliveryFee}
                    onChange={(e) => setRestaurantForm(prev => ({ ...prev, deliveryFee: e.target.value }))}
                    placeholder="2.99"
                    data-testid="input-restaurant-delivery-fee"
                  />
                  <p className="text-xs text-muted-foreground">
                    Fee charged for delivery ($0-$50)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minimumOrder" className="text-sm font-medium">
                    Minimum Order ($)
                  </Label>
                  <Input 
                    id="minimumOrder"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={restaurantForm.minimumOrder}
                    onChange={(e) => setRestaurantForm(prev => ({ ...prev, minimumOrder: e.target.value }))}
                    placeholder="15.00"
                    data-testid="input-restaurant-minimum-order"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum order value for delivery
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rating" className="text-sm font-medium">
                    Rating (1-5)
                  </Label>
                  <Input 
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={restaurantForm.rating}
                    onChange={(e) => setRestaurantForm(prev => ({ ...prev, rating: e.target.value }))}
                    placeholder="4.5"
                    data-testid="input-restaurant-rating"
                  />
                  <p className="text-xs text-muted-foreground">
                    Restaurant rating out of 5 stars
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reviewCount" className="text-sm font-medium">
                    Review Count
                  </Label>
                  <Input 
                    id="reviewCount"
                    type="number"
                    min="0"
                    value={restaurantForm.reviewCount}
                    onChange={(e) => setRestaurantForm(prev => ({ ...prev, reviewCount: e.target.value }))}
                    placeholder="125"
                    data-testid="input-restaurant-review-count"
                  />
                  <p className="text-xs text-muted-foreground">
                    Total number of customer reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Restaurant Status & Settings Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Settings className="w-4 h-4 text-primary" />
                <h3 className="font-medium">Restaurant Status & Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Switch
                      checked={restaurantForm.isOpen}
                      onCheckedChange={(checked) => setRestaurantForm(prev => ({ ...prev, isOpen: checked }))}
                      data-testid="switch-restaurant-open"
                    />
                    Restaurant Open
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Controls if the restaurant accepts orders
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Switch
                      checked={restaurantForm.isTemporarilyClosed}
                      onCheckedChange={(checked) => setRestaurantForm(prev => ({ ...prev, isTemporarilyClosed: checked }))}
                      data-testid="switch-restaurant-temporarily-closed"
                    />
                    Temporarily Closed
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Mark as temporarily closed for maintenance
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-sm font-medium">
                    Timezone
                  </Label>
                  <Select value={restaurantForm.timezone} onValueChange={(value) => setRestaurantForm(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger data-testid="select-restaurant-timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (New York)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (Chicago)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (Denver)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (Los Angeles)</SelectItem>
                      <SelectItem value="America/Anchorage">Alaska Time (Anchorage)</SelectItem>
                      <SelectItem value="Pacific/Honolulu">Hawaii Time (Honolulu)</SelectItem>
                      <SelectItem value="Europe/London">GMT (London)</SelectItem>
                      <SelectItem value="Europe/Paris">CET (Paris)</SelectItem>
                      <SelectItem value="Europe/Berlin">CET (Berlin)</SelectItem>
                      <SelectItem value="Europe/Rome">CET (Rome)</SelectItem>
                      <SelectItem value="Asia/Tokyo">JST (Tokyo)</SelectItem>
                      <SelectItem value="Asia/Shanghai">CST (Shanghai)</SelectItem>
                      <SelectItem value="Asia/Kolkata">IST (Kolkata)</SelectItem>
                      <SelectItem value="Asia/Dubai">GST (Dubai)</SelectItem>
                      <SelectItem value="Asia/Dhaka">BST (Dhaka)</SelectItem>
                      <SelectItem value="Australia/Sydney">AEDT (Sydney)</SelectItem>
                      <SelectItem value="Australia/Melbourne">AEDT (Melbourne)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Restaurant's local timezone for operating hours
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="font-medium">Contact Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Full Address
                  </Label>
                  <Textarea 
                    id="address"
                    value={restaurantForm.address}
                    onChange={(e) => setRestaurantForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main Street, City, State, ZIP Code"
                    rows={2}
                    data-testid="input-restaurant-address"
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Complete address including city and postal code
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input 
                    id="phone"
                    type="tel"
                    value={restaurantForm.phone}
                    onChange={(e) => setRestaurantForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    pattern="[0-9\s\(\)\-\+\.]+"
                    data-testid="input-restaurant-phone"
                  />
                  <p className="text-xs text-muted-foreground">
                    Contact number for customer inquiries
                  </p>
                </div>
              </div>
            </div>

            {/* Operating Hours Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="font-medium">Operating Hours</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Hours Setup</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={restaurantForm.operatingHoursMode === "default" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRestaurantForm(prev => ({ ...prev, operatingHoursMode: "default" }))}
                    >
                      Default (Same Daily)
                    </Button>
                    <Button
                      type="button"
                      variant={restaurantForm.operatingHoursMode === "advanced" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRestaurantForm(prev => ({ ...prev, operatingHoursMode: "advanced" }))}
                    >
                      Advanced (Per Day)
                    </Button>
                  </div>
                </div>

                {restaurantForm.operatingHoursMode === "default" ? (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <Label htmlFor="defaultOpen" className="text-sm font-medium">Opening Time</Label>
                      <Input
                        id="defaultOpen"
                        type="time"
                        value={restaurantForm.defaultOpen}
                        onChange={(e) => {
                          const time = e.target.value;
                          setRestaurantForm(prev => ({ 
                            ...prev, 
                            defaultOpen: time,
                            operatingHours: {
                              monday: { ...prev.operatingHours.monday, open: time },
                              tuesday: { ...prev.operatingHours.tuesday, open: time },
                              wednesday: { ...prev.operatingHours.wednesday, open: time },
                              thursday: { ...prev.operatingHours.thursday, open: time },
                              friday: { ...prev.operatingHours.friday, open: time },
                              saturday: { ...prev.operatingHours.saturday, open: time },
                              sunday: { ...prev.operatingHours.sunday, open: time },
                            }
                          }));
                        }}
                        data-testid="input-default-open"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultClose" className="text-sm font-medium">Closing Time</Label>
                      <Input
                        id="defaultClose"
                        type="time"
                        value={restaurantForm.defaultClose}
                        onChange={(e) => {
                          const time = e.target.value;
                          setRestaurantForm(prev => ({ 
                            ...prev, 
                            defaultClose: time,
                            operatingHours: {
                              monday: { ...prev.operatingHours.monday, close: time },
                              tuesday: { ...prev.operatingHours.tuesday, close: time },
                              wednesday: { ...prev.operatingHours.wednesday, close: time },
                              thursday: { ...prev.operatingHours.thursday, close: time },
                              friday: { ...prev.operatingHours.friday, close: time },
                              saturday: { ...prev.operatingHours.saturday, close: time },
                              sunday: { ...prev.operatingHours.sunday, close: time },
                            }
                          }));
                        }}
                        data-testid="input-default-close"
                      />
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground">
                      All days will use the same hours: {restaurantForm.defaultOpen} - {restaurantForm.defaultClose}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(restaurantForm.operatingHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="w-20 text-sm font-medium capitalize">{day}</div>
                        <div className="flex items-center gap-2 flex-1">
                          <Switch
                            checked={!hours.closed}
                            onCheckedChange={(checked) => 
                              setRestaurantForm(prev => ({
                                ...prev,
                                operatingHours: {
                                  ...prev.operatingHours,
                                  [day]: { ...hours, closed: !checked }
                                }
                              }))
                            }
                          />
                          {!hours.closed ? (
                            <>
                              <Input
                                type="time"
                                value={hours.open}
                                onChange={(e) => 
                                  setRestaurantForm(prev => ({
                                    ...prev,
                                    operatingHours: {
                                      ...prev.operatingHours,
                                      [day]: { ...hours, open: e.target.value }
                                    }
                                  }))
                                }
                                className="w-32"
                              />
                              <span className="text-muted-foreground">to</span>
                              <Input
                                type="time"
                                value={hours.close}
                                onChange={(e) => 
                                  setRestaurantForm(prev => ({
                                    ...prev,
                                    operatingHours: {
                                      ...prev.operatingHours,
                                      [day]: { ...hours, close: e.target.value }
                                    }
                                  }))
                                }
                                className="w-32"
                              />
                            </>
                          ) : (
                            <span className="text-muted-foreground text-sm">Closed</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Restaurant Logo Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <ImageIcon className="w-4 h-4 text-primary" />
                <h3 className="font-medium">Restaurant Logo</h3>
              </div>
              
              <LogoUploader
                value={restaurantForm.image}
                onChange={(filename) => setRestaurantForm(prev => ({ ...prev, image: filename }))}
                label="Restaurant Logo"
              />
              <p className="text-xs text-muted-foreground">
                Upload a high-quality logo that represents your restaurant. This will be displayed on restaurant cards and profile pages.
              </p>
            </div>

            {/* Form Actions */}
            <DialogFooter className="flex gap-2 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setRestaurantDialog({...restaurantDialog, open: false});
                  setRestaurantForm(getDefaultRestaurantForm());
                }}
                disabled={createRestaurantMutation.isPending || updateRestaurantMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createRestaurantMutation.isPending || updateRestaurantMutation.isPending || !restaurantForm.name || !restaurantForm.cuisine}
                data-testid="button-save-restaurant"
                className="min-w-[120px]"
              >
                {(createRestaurantMutation.isPending || updateRestaurantMutation.isPending) ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  restaurantDialog.mode === "edit" ? "Update Restaurant" : "Create Restaurant"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Coupon Dialog */}
      <Dialog open={couponDialog.open} onOpenChange={(open) => setCouponDialog({...couponDialog, open})}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {couponDialog.mode === "edit" ? "Edit Coupon" : "Create New Coupon"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCouponSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">
                Coupon Code <span className="text-red-500">*</span>
              </Label>
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
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
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
              <Label htmlFor="discountType">
                Discount Type <span className="text-red-500">*</span>
              </Label>
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
              <Label htmlFor="discountValue">
                Discount Value <span className="text-red-500">*</span>
              </Label>
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
              <Label htmlFor="startDate">
                Start Date <span className="text-red-500">*</span>
              </Label>
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
              <Label htmlFor="endDate">
                End Date <span className="text-red-500">*</span>
              </Label>
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
              <Select value={couponForm.restaurantId || "platform-wide"} onValueChange={(value) => setCouponForm(prev => ({ ...prev, restaurantId: value === "platform-wide" ? "" : value }))}>
                <SelectTrigger data-testid="select-coupon-restaurant">
                  <SelectValue placeholder="Platform-wide" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform-wide">Platform-wide</SelectItem>
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
            <div className="col-span-2 flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={couponForm.isActive}
                onCheckedChange={(checked) => setCouponForm(prev => ({ ...prev, isActive: checked }))}
                data-testid="switch-coupon-status"
              />
              <Label htmlFor="isActive">Active Status</Label>
              <span className="text-sm text-muted-foreground">
                {couponForm.isActive ? "Coupon is active and can be used" : "Coupon is inactive and cannot be used"}
              </span>
            </div>
            <DialogFooter className="col-span-2">
              <Button type="button" variant="outline" onClick={() => setCouponDialog({...couponDialog, open: false})}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createCouponMutation.isPending || updateCouponMutation.isPending}
                data-testid="button-save-coupon"
              >
                {(createCouponMutation.isPending || updateCouponMutation.isPending) ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  couponDialog.mode === "edit" ? "Update Coupon" : "Create Coupon"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog open={menuItemDialog.open} onOpenChange={(open) => setMenuItemDialog({...menuItemDialog, open})}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {menuItemDialog.mode === "edit" ? "Edit Menu Item" : "Add New Menu Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMenuItemSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input 
                id="name"
                value={menuItemForm.name}
                onChange={(e) => setMenuItemForm(prev => ({ ...prev, name: e.target.value }))}
                required
                data-testid="input-menu-item-name"
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input 
                id="price"
                type="number"
                step="0.01"
                value={menuItemForm.price}
                onChange={(e) => setMenuItemForm(prev => ({ ...prev, price: e.target.value }))}
                required
                data-testid="input-menu-item-price"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={menuItemForm.description}
                onChange={(e) => setMenuItemForm(prev => ({ ...prev, description: e.target.value }))}
                data-testid="input-menu-item-description"
              />
            </div>
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select value={menuItemForm.categoryId} onValueChange={(value) => setMenuItemForm(prev => ({ ...prev, categoryId: value }))}>
                <SelectTrigger data-testid="select-menu-item-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: MenuCategory) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="preparationTime">Preparation Time (minutes)</Label>
              <Input 
                id="preparationTime"
                type="number"
                value={menuItemForm.preparationTime}
                onChange={(e) => setMenuItemForm(prev => ({ ...prev, preparationTime: e.target.value }))}
                placeholder="15"
                data-testid="input-menu-item-prep-time"
              />
            </div>
            <div className="col-span-2">
              <MenuItemImageUploader
                label="Menu Item Image"
                value={menuItemForm.image}
                onChange={(filePath) => setMenuItemForm(prev => ({ ...prev, image: filePath }))}
                restaurantId={selectedRestaurant}
              />
            </div>
            <div className="col-span-2 flex items-center space-x-2">
              <Switch
                checked={menuItemForm.isAvailable}
                onCheckedChange={(checked) => setMenuItemForm(prev => ({ ...prev, isAvailable: checked }))}
                data-testid="switch-menu-item-available"
              />
              <Label htmlFor="isAvailable">Available for ordering</Label>
            </div>
            <DialogFooter className="col-span-2">
              <Button type="button" variant="outline" onClick={() => setMenuItemDialog({...menuItemDialog, open: false})}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMenuItemMutation.isPending || updateMenuItemMutation.isPending || !selectedRestaurant}
                data-testid="button-save-menu-item"
              >
                {(createMenuItemMutation.isPending || updateMenuItemMutation.isPending) ? "Saving..." : 
                 menuItemDialog.mode === "edit" ? "Update Menu Item" : "Save Menu Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialog.open} onOpenChange={(open) => setCategoryDialog({...categoryDialog, open})}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {categoryDialog.mode === "edit" ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input 
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Appetizers, Main Courses, Desserts"
                required
                data-testid="input-category-name"
              />
            </div>
            <div>
              <Label htmlFor="categoryDescription">Description (optional)</Label>
              <Textarea 
                id="categoryDescription"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this category"
                rows={3}
                data-testid="input-category-description"
              />
            </div>
            <div>
              <Label htmlFor="displayOrder">Display Order (optional)</Label>
              <Input 
                id="displayOrder"
                type="number"
                min="0"
                value={categoryForm.displayOrder}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, displayOrder: e.target.value }))}
                placeholder="1"
                data-testid="input-category-display-order"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lower numbers appear first (1, 2, 3...)
              </p>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setCategoryDialog({open: false, mode: "create", data: null})}
                data-testid="button-cancel-category"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                data-testid="button-save-category"
              >
                {(createCategoryMutation.isPending || updateCategoryMutation.isPending) ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  categoryDialog.mode === "edit" ? "Update Category" : "Create Category"
                )}
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