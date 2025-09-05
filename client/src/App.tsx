import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Restaurant from "@/pages/restaurant";
import Restaurants from "@/pages/restaurants";
import FoodItemDetail from "@/pages/food-item-detail";
import AuthPage from "@/pages/auth-page";
import Admin from "@/pages/admin";
import Checkout from "@/pages/checkout";
import StripeCheckout from "@/pages/stripe-checkout";
import Orders from "@/pages/orders";
import OrderDetail from "@/pages/order-detail";
import Terms from "@/pages/legal/terms";
import Privacy from "@/pages/legal/privacy";
import Refund from "@/pages/legal/refund";
import Help from "@/pages/help";
import Contact from "@/pages/contact";
import FAQ from "@/pages/faq";
import NotFound from "@/pages/not-found";
import { CartProvider } from "@/contexts/CartContext";
import UniversalCartSidebar from "@/components/universal-cart-sidebar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state instead of conditional routing to prevent rerenders
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Switch>
      {/* Public routes - always available */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/restaurants" component={Restaurants} />
      <Route path="/restaurant/:restaurantSlug/item/:itemId" component={FoodItemDetail} />
      <Route path="/restaurant/:slug" component={Restaurant} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/stripe-checkout" component={StripeCheckout} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/refund" component={Refund} />
      <Route path="/help" component={Help} />
      <Route path="/contact" component={Contact} />
      <Route path="/faq" component={FAQ} />
      
      {/* Conditional routes based on authentication */}
      <Route path="/" component={isAuthenticated ? Home : Landing} />
      {isAuthenticated && <Route path="/admin" component={Admin} />}
      {isAuthenticated && <Route path="/orders" component={Orders} />}
      {isAuthenticated && <Route path="/orders/:id" component={OrderDetail} />}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Router />
          <UniversalCartSidebar />
          <Toaster />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
