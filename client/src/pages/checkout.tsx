import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import NavigationHeader from "@/components/navigation-header";
import CartSidebar from "@/components/ui/cart-sidebar";
import { ArrowLeft, CreditCard, MapPin, Clock } from "lucide-react";
import { Link } from "wouter";
import { useLocation } from "wouter";

export default function Checkout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { cartItems, updateQuantity, removeFromCart, cartItemCount, cartTotal, isCartOpen, setIsCartOpen } = useCart();
  const [orderForm, setOrderForm] = useState({
    deliveryAddress: "",
    deliveryInstructions: "",
    paymentMethod: "card",
  });
  
  useDocumentTitle("Checkout - West Row Kitchen");

  const subtotal = cartTotal;
  const deliveryFee = 2.99;
  const serviceFee = subtotal * 0.05;
  const tax = (subtotal + deliveryFee + serviceFee) * 0.0875;
  const total = subtotal + deliveryFee + serviceFee + tax;

  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Placed!",
        description: "Your order has been confirmed and is being prepared.",
      });
      // Redirect to orders page
      window.location.href = "/orders";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderForm.deliveryAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a delivery address.",
        variant: "destructive",
      });
      return;
    }

    // Group items by restaurant
    const restaurantOrders = cartItems.reduce((acc, item) => {
      const key = item.restaurantId;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, typeof cartItems>);

    // For now, just place one order for the first restaurant
    const firstRestaurant = Object.keys(restaurantOrders)[0];
    const restaurantItems = restaurantOrders[firstRestaurant];

    placeOrderMutation.mutate({
      restaurantId: "sample-restaurant-id", // This would be the actual restaurant ID
      totalAmount: total,
      deliveryFee,
      serviceFee,
      tax,
      deliveryAddress: orderForm.deliveryAddress,
      deliveryInstructions: orderForm.deliveryInstructions,
      status: "pending",
      items: restaurantItems.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      })),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      
      <NavigationHeader />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Restaurants
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your full delivery address..."
                    value={orderForm.deliveryAddress}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    required
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Any special instructions for the delivery driver..."
                    value={orderForm.deliveryInstructions}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, deliveryInstructions: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="card"
                      name="payment"
                      value="card"
                      checked={orderForm.paymentMethod === "card"}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    />
                    <label htmlFor="card" className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Credit/Debit Card
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="cash"
                      name="payment"
                      value="cash"
                      checked={orderForm.paymentMethod === "cash"}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    />
                    <label htmlFor="cash">Cash on Delivery</label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Service Fee</span>
                    <span>${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Estimated delivery: 25-35 minutes</span>
                </div>
                {orderForm.paymentMethod === "card" ? (
                  <div className="space-y-3">
                    <Button 
                      onClick={() => {
                        if (!orderForm.deliveryAddress.trim()) {
                          toast({
                            title: "Error",
                            description: "Please enter a delivery address before proceeding to payment.",
                            variant: "destructive",
                          });
                          return;
                        }
                        // Store order form data temporarily for stripe checkout
                        localStorage.setItem('checkout-form-data', JSON.stringify({
                          deliveryAddress: orderForm.deliveryAddress,
                          deliveryInstructions: orderForm.deliveryInstructions,
                          paymentMethod: orderForm.paymentMethod
                        }));
                        setLocation("/stripe-checkout");
                      }}
                      className="w-full btn-primary py-3 text-lg"
                    >
                      Pay with Card - ${total.toFixed(2)}
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Secure payment processing by Stripe
                    </p>
                  </div>
                ) : (
                  <Button 
                    onClick={handlePlaceOrder}
                    className="w-full btn-primary py-3 text-lg"
                    disabled={placeOrderMutation.isPending}
                  >
                    {placeOrderMutation.isPending ? "Placing Order..." : `Place Order - ${total.toFixed(2)} (Cash on Delivery)`}
                  </Button>
                )}
                <p className="text-xs text-gray-500 text-center mt-2">
                  By placing this order, you agree to our Terms of Service and Privacy Policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Cart sidebar now handled globally by UniversalCartSidebar */}
    </div>
  );
}
