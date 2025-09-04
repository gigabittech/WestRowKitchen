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
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Clock,
  User,
  Phone,
  Banknote,
} from "lucide-react";
import { Link } from "wouter";
import { useLocation } from "wouter";

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    cartItemCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
  } = useCart();
  const [orderForm, setOrderForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
    deliveryInstructions: "",
    paymentMethod: "card",
  });

  useDocumentTitle("Checkout - West Row Kitchen");

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Please Sign In",
        description: "You need to sign in to place an order.",
        variant: "destructive",
      });
      setLocation("/auth");
    }
  }, [isAuthenticated, setLocation, toast]);

  // Pre-fill user information if available
  useEffect(() => {
    if (user && isAuthenticated) {
      setOrderForm((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      }));
    }
  }, [user, isAuthenticated]);

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

  const validateForm = () => {
    const requiredFields = [
      { field: "firstName", label: "First Name" },
      { field: "lastName", label: "Last Name" },
      { field: "email", label: "Email" },
      { field: "phone", label: "Phone Number" },
      { field: "streetAddress", label: "Street Address" },
      { field: "city", label: "City" },
      { field: "state", label: "State/Province" },
      { field: "postalCode", label: "Postal Code" },
    ];

    for (const { field, label } of requiredFields) {
      if (!orderForm[field as keyof typeof orderForm].trim()) {
        toast({
          title: "Missing Information",
          description: `Please enter your ${label.toLowerCase()}.`,
          variant: "destructive",
        });
        return false;
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderForm.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    // Basic phone validation (10+ digits)
    const phoneDigits = orderForm.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description:
          "Please enter a valid phone number with at least 10 digits.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Group items by restaurant
    const restaurantOrders = cartItems.reduce(
      (acc, item) => {
        const key = item.restaurantId;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      },
      {} as Record<string, typeof cartItems>,
    );

    // For now, just place one order for the first restaurant
    const firstRestaurant = Object.keys(restaurantOrders)[0];
    const restaurantItems = restaurantOrders[firstRestaurant];

    const fullDeliveryAddress = `${orderForm.streetAddress}${orderForm.apartment ? ", " + orderForm.apartment : ""}, ${orderForm.city}, ${orderForm.state} ${orderForm.postalCode}`;

    placeOrderMutation.mutate({
      restaurantId: firstRestaurant || "default-restaurant-id",
      totalAmount: total,
      deliveryFee,
      serviceFee,
      tax,
      deliveryAddress: fullDeliveryAddress,
      deliveryInstructions: orderForm.deliveryInstructions,
      status: "pending",
      items: restaurantItems.map((item) => ({
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
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      value={orderForm.firstName}
                      onChange={(e) =>
                        setOrderForm((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      required
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      value={orderForm.lastName}
                      onChange={(e) =>
                        setOrderForm((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      required
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={orderForm.email}
                    onChange={(e) =>
                      setOrderForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">
                    Phone Number *{" "}
                    <span className="text-sm text-gray-500">
                      (for delivery coordination)
                    </span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={orderForm.phone}
                    onChange={(e) =>
                      setOrderForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    required
                    data-testid="input-phone"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    type="text"
                    placeholder="Enter your street address"
                    value={orderForm.streetAddress}
                    onChange={(e) =>
                      setOrderForm((prev) => ({
                        ...prev,
                        streetAddress: e.target.value,
                      }))
                    }
                    required
                    data-testid="input-street-address"
                  />
                </div>
                <div>
                  <Label htmlFor="apartment">
                    Apartment, Unit, Building (Optional)
                  </Label>
                  <Input
                    id="apartment"
                    type="text"
                    placeholder="Apt, Suite, Floor, etc."
                    value={orderForm.apartment}
                    onChange={(e) =>
                      setOrderForm((prev) => ({
                        ...prev,
                        apartment: e.target.value,
                      }))
                    }
                    data-testid="input-apartment"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Enter city"
                      value={orderForm.city}
                      onChange={(e) =>
                        setOrderForm((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      required
                      data-testid="input-city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      type="text"
                      placeholder="Enter state/province"
                      value={orderForm.state}
                      onChange={(e) =>
                        setOrderForm((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      required
                      data-testid="input-state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      type="text"
                      placeholder="Enter postal code"
                      value={orderForm.postalCode}
                      onChange={(e) =>
                        setOrderForm((prev) => ({
                          ...prev,
                          postalCode: e.target.value,
                        }))
                      }
                      required
                      data-testid="input-postal-code"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="instructions">
                    Delivery Instructions (Optional)
                  </Label>
                  <Textarea
                    id="instructions"
                    placeholder="Special instructions for delivery driver (gate codes, building access, etc.)"
                    value={orderForm.deliveryInstructions}
                    onChange={(e) =>
                      setOrderForm((prev) => ({
                        ...prev,
                        deliveryInstructions: e.target.value,
                      }))
                    }
                    data-testid="input-delivery-instructions"
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
                      onChange={(e) =>
                        setOrderForm((prev) => ({
                          ...prev,
                          paymentMethod: e.target.value,
                        }))
                      }
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
                      onChange={(e) =>
                        setOrderForm((prev) => ({
                          ...prev,
                          paymentMethod: e.target.value,
                        }))
                      }
                    />
                    <label htmlFor="cash" className="flex items-center">
                      <Banknote className="w-4 h-4 mr-2" />
                      Cash on Delivery
                    </label>
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
                  <div
                    key={item.id}
                    className="flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </div>
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
                        if (!validateForm()) {
                          return;
                        }

                        // Store order form data temporarily for stripe checkout
                        const fullDeliveryAddress = `${orderForm.streetAddress}${orderForm.apartment ? ", " + orderForm.apartment : ""}, ${orderForm.city}, ${orderForm.state} ${orderForm.postalCode}`;
                        localStorage.setItem(
                          "checkout-form-data",
                          JSON.stringify({
                            ...orderForm,
                            deliveryAddress: fullDeliveryAddress,
                          }),
                        );
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
                    {placeOrderMutation.isPending ? (
                      "Placing Order..."
                    ) : (
                      <>
                        Place Order - ${total.toFixed(2)}
                        <br />
                      </>
                    )}
                  </Button>
                )}
                <p className="text-xs text-gray-500 text-center mt-2">
                  By placing this order, you agree to our Terms of Service and
                  Privacy Policy.
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
