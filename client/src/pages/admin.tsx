import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavigationHeader from "@/components/navigation-header";
import RestaurantManagement from "@/components/admin/RestaurantManagement";
import AdminStats from "@/components/admin/AdminStats";
import UserManagement from "@/components/admin/UserManagement";
import type { Restaurant, MenuItem, Order, User, Coupon } from "@shared/schema";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

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
  }, [isAuthenticated, isLoading, user, toast, setLocation]);

  // Data fetching for stats
  const { data: restaurants = [] } = useQuery({
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show error if not admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">Admin access required to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage restaurants, orders, users, and coupons from this central dashboard.
          </p>
        </div>

        {/* Stats Overview */}
        <AdminStats 
          restaurants={restaurants}
          orders={allOrders}
          users={users}
          coupons={coupons}
        />

        {/* Main Admin Tabs */}
        <Tabs defaultValue="restaurants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="restaurants" data-testid="tab-restaurants">
              Restaurants
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              Orders
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">
              Users
            </TabsTrigger>
            <TabsTrigger value="coupons" data-testid="tab-coupons">
              Coupons
            </TabsTrigger>
          </TabsList>

          <TabsContent value="restaurants" className="space-y-6">
            <RestaurantManagement user={user} />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Order management component coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement currentUser={user} />
          </TabsContent>

          <TabsContent value="coupons" className="space-y-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Coupon management component coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}