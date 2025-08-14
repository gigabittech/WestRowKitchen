import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavigationHeader from "@/components/navigation-header";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

// Use test Stripe public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_4eC39HqLyjWDarjtT1zdp7dc");

const CheckoutForm = ({ total }: { total: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/orders",
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Your order has been placed successfully!",
      });
      setLocation("/orders");
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
  const [total] = useState(45.50); // Mock total - would come from cart state

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    apiRequest("POST", "/api/create-payment-intent", { 
      amount: total,
      items: [{ id: "test-item" }]
    })
      .then((response) => response.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [total]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader isCartOpen={false} setIsCartOpen={() => {}} cartItemCount={0} />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="h-screen flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader isCartOpen={false} setIsCartOpen={() => {}} cartItemCount={0} />
      
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
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm total={total} />
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