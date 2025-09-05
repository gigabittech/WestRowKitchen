import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import NavigationHeader from "@/components/navigation-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  LayoutDashboard,
  Store, 
  ShoppingBag, 
  Ticket, 
  MenuSquare, 
  Users
} from "lucide-react";

// Import all admin page components
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminRestaurants from "@/pages/admin/AdminRestaurants";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCoupons from "@/pages/admin/AdminCoupons";
import AdminMenu from "@/pages/admin/AdminMenu";
import AdminUsers from "@/pages/admin/AdminUsers";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Get current section from URL
  const getCurrentSection = () => {
    if (location === "/admin/restaurants") return "restaurants";
    if (location === "/admin/orders") return "orders";
    if (location === "/admin/coupons") return "coupons";
    if (location === "/admin/menu") return "menu";
    if (location === "/admin/users") return "users";
    return "overview";
  };

  const currentSection = getCurrentSection();

  // Navigation items
  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      path: "/admin",
    },
    {
      id: "restaurants",
      label: "Restaurants",
      icon: Store,
      path: "/admin/restaurants",
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingBag,
      path: "/admin/orders",
    },
    {
      id: "coupons",
      label: "Coupons",
      icon: Ticket,
      path: "/admin/coupons",
    },
    {
      id: "menu",
      label: "Menu",
      icon: MenuSquare,
      path: "/admin/menu",
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
      path: "/admin/users",
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Authorization check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">You need to log in to access the admin panel.</p>
            <Button onClick={() => window.location.href = "/api/login"}>
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">You don't have permission to access the admin panel.</p>
            <Button onClick={() => setLocation("/")}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the appropriate admin section component
  const renderAdminSection = () => {
    switch (currentSection) {
      case "restaurants":
        return <AdminRestaurants />;
      case "orders":
        return <AdminOrders />;
      case "coupons":
        return <AdminCoupons />;
      case "menu":
        return <AdminMenu />;
      case "users":
        return <AdminUsers />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentSection === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setLocation(item.path)}
                        data-testid={`nav-${item.id}`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            {renderAdminSection()}
          </main>
        </div>
      </div>
    </div>
  );
}