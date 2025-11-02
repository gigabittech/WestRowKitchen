import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, MapPin, Phone, Loader2 } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";

export default function DoorDashCheckoutSuccess() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [orderId, setOrderId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useDocumentTitle("Order Confirmed - West Row Kitchen");

  // Get order ID from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdParam = urlParams.get('order_id') || urlParams.get('orderId');
    if (orderIdParam) {
      setOrderId(orderIdParam);
    } else {
      // If no order ID, redirect to orders page
      setLocation("/orders");
    }
  }, [setLocation]);

  // Fetch order status from DoorDash
  const { data: orderStatus, isLoading: statusLoading, error } = useQuery({
    queryKey: ['doordash-order-status', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      const response = await apiRequest("GET", `/api/checkout/doordash/order/${orderId}/status`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch order status");
      }
      
      return result.data;
    },
    enabled: !!orderId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    if (orderId) {
      setIsLoading(false);
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Order Status Error</h2>
                  <p className="text-gray-600 mb-4">
                    We couldn't retrieve your order status. Please contact support if this persists.
                  </p>
                  <div className="space-y-2">
                    <Button onClick={() => setLocation("/orders")} className="w-full">
                      View My Orders
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setLocation("/restaurants")}
                      className="w-full"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'preparing':
        return 'text-yellow-600 bg-yellow-100';
      case 'ready_for_pickup':
        return 'text-blue-600 bg-blue-100';
      case 'picked_up':
        return 'text-purple-600 bg-purple-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Preparing Your Order';
      case 'ready_for_pickup':
        return 'Ready for Pickup';
      case 'picked_up':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Processing';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600">
              Your order has been placed successfully with DoorDash
            </p>
            {orderId && (
              <p className="text-sm text-gray-500 mt-2">
                Order ID: {orderId}
              </p>
            )}
          </div>

          {/* Order Status Card */}
          {orderStatus && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderStatus.status)}`}>
                      {getStatusText(orderStatus.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Payment:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      orderStatus.paymentStatus === 'completed' 
                        ? 'text-green-600 bg-green-100' 
                        : 'text-yellow-600 bg-yellow-100'
                    }`}>
                      {orderStatus.paymentStatus === 'completed' ? 'Paid' : 'Processing'}
                    </span>
                  </div>

                  {orderStatus.estimatedDeliveryTime && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Estimated Delivery:</span>
                      <span className="text-gray-600">
                        {new Date(orderStatus.estimatedDeliveryTime).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {orderStatus.driverInfo && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Driver Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm">{orderStatus.driverInfo.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm">{orderStatus.driverInfo.phone}</span>
                        </div>
                        {orderStatus.driverInfo.vehicleInfo && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-sm">{orderStatus.driverInfo.vehicleInfo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {orderStatus.trackingUrl && (
                    <div className="border-t pt-4">
                      <Button 
                        onClick={() => window.open(orderStatus.trackingUrl, '_blank')}
                        className="w-full"
                      >
                        Track Your Order
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => setLocation("/orders")} 
              className="w-full"
            >
              View All Orders
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/restaurants")}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>

          {/* Loading State */}
          {statusLoading && (
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-gray-600">Updating order status...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
