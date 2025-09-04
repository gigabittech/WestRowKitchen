import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cacheUtils, queryKeys } from "@/lib/queryKeys";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavigationHeader from "@/components/navigation-header";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

const CheckoutForm = ({ total, orderData }: { total: number; orderData: any }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [processing, setProcessing] = useState(false);
  const { cartItems, clearCart } = useCart();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/orders",
        },
        redirect: "if_required"
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment successful, now create the order
        try {
          const response = await apiRequest("POST", "/api/orders", orderData);
          const result = await response.json();
          
          if (response.ok) {
            clearCart();
            
            // Smart invalidation for related data after successful order
            cacheUtils.invalidateOrderCreation(queryClient, {
              restaurantId: orderData.restaurantId,
            });
            
            // Clean up temporary form data
            localStorage.removeItem('checkout-form-data');
            toast({
              title: "Order Placed Successfully!",
              description: "Your payment was processed and order has been confirmed.",
            });
            setLocation("/orders");
          } else {
            throw new Error(result.message || "Failed to create order");
          }
        } catch (orderError: any) {
          toast({
            title: "Payment Successful, Order Issue",
            description: "Your payment was processed but there was an issue creating the order. Please contact support.",
            variant: "destructive",
          });
        }
      }
    } catch (paymentError: any) {
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    }
    
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || processing}
        className="w-full"
      >
        {processing ? "Processing..." : `Pay $${total.toFixed(2)}`}
      </Button>
    </form>
  );
};

export default function StripeCheckout() {
  const [clientSecret, setClientSecret] = useState("");
  const { cartItems, cartTotal } = useCart();
  const [, setLocation] = useLocation();
  
  useDocumentTitle("Complete Payment - West Row Kitchen");
  
  // Get checkout form data from localStorage (includes coupon totals)
  const getCheckoutFormData = () => {
    try {
      const formData = localStorage.getItem('checkout-form-data');
      if (formData) {
        return JSON.parse(formData);
      }
    } catch (error) {
      console.error('Failed to parse checkout form data:', error);
    }
    return {
      deliveryAddress: "",
      deliveryInstructions: "",
      paymentMethod: "card",
      totals: {
        subtotal: cartTotal,
        deliveryFee: 2.99,
        serviceFee: cartTotal * 0.05,
        tax: (cartTotal + 2.99 + cartTotal * 0.05) * 0.0875,
        total: cartTotal + 2.99 + cartTotal * 0.05 + (cartTotal + 2.99 + cartTotal * 0.05) * 0.0875,
      }
    };
  };

  const checkoutFormData = getCheckoutFormData();
  
  // Use stored totals (which include coupon discounts) or fallback to calculated
  const subtotal = checkoutFormData.totals?.subtotal || cartTotal;
  const deliveryFee = checkoutFormData.totals?.deliveryFee || 2.99;
  const serviceFee = checkoutFormData.totals?.serviceFee || subtotal * 0.05;
  const tax = checkoutFormData.totals?.tax || (subtotal + deliveryFee + serviceFee) * 0.0875;
  const total = checkoutFormData.totals?.total || subtotal + deliveryFee + serviceFee + tax;


  // Prepare order data for after payment
  const orderData = {
    restaurantId: cartItems.length > 0 ? cartItems[0].restaurantId : "unknown",
    totalAmount: total.toFixed(2),
    deliveryFee: deliveryFee.toFixed(2),
    serviceFee: serviceFee.toFixed(2),
    tax: tax.toFixed(2),
    discountAmount: checkoutFormData.couponDiscount?.itemDiscount?.toFixed(2) || "0.00",
    couponCode: checkoutFormData.appliedCoupon?.code || null,
    customerName: `${checkoutFormData.firstName || ''} ${checkoutFormData.lastName || ''}`.trim(),
    customerEmail: checkoutFormData.email || '',
    customerPhone: checkoutFormData.phone || '',
    deliveryAddress: checkoutFormData.deliveryAddress,
    deliveryInstructions: checkoutFormData.deliveryInstructions,
    status: "pending",
    items: cartItems.map(item => ({
      menuItemId: item.id,
      quantity: item.quantity,
      unitPrice: item.price.toFixed(2),
      totalPrice: (item.price * item.quantity).toFixed(2),
    })),
  };

  useEffect(() => {
    // Redirect back to checkout if cart is empty or no delivery address
    if (cartItems.length === 0) {
      setLocation("/checkout");
      return;
    }

    if (!checkoutFormData.streetAddress || !checkoutFormData.streetAddress.trim()) {
      setLocation("/checkout");
      return;
    }

    // Create PaymentIntent as soon as the page loads
    apiRequest("POST", "/api/create-payment-intent", { 
      amount: total
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error(data.message || "Failed to create payment intent");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [total, cartItems.length, setLocation]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" aria-label="Loading"/>
              <p className="text-gray-600">Setting up secure payment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/checkout" className="flex items-center text-gray-600 hover:text-gray-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Order Summary
          </Link>
          <h1 className="text-3xl font-bold">Complete Payment</h1>
          <p className="text-gray-600 mt-2">Enter your payment information to place your order</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">💳</span>
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {/* Show discount line if coupon is applied */}
                {checkoutFormData.appliedCoupon && checkoutFormData.couponDiscount?.itemDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({checkoutFormData.appliedCoupon.code})</span>
                    <span>-${checkoutFormData.couponDiscount.itemDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Fee{checkoutFormData.appliedCoupon?.discountType === "free_delivery" ? " (Free)" : ""}</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm total={total} orderData={orderData} />
            </Elements>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🔒 Your payment information is secure and encrypted</p>
          <p>Test mode: Use card 4242 4242 4242 4242</p>
        </div>
      </div>
    </div>
  );
}