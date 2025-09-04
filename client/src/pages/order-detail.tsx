import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryKeys } from "@/lib/queryKeys";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import NavigationHeader from "@/components/navigation-header";
import { Clock, MapPin, Package, ArrowLeft, AlertCircle, RefreshCw, Phone, Mail, User, Utensils } from "lucide-react";
import { Link, useParams } from "wouter";
import type { Order } from "@shared/schema";
import { getFoodImage } from "@/utils/food-images";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToCart, clearCart, cartItems } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: order, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<Order & { items?: any[]; appliedCoupon?: any }>({
    queryKey: ["/api/orders/detail", id],
    enabled: !!user?.id && !!id,
    staleTime: 1000 * 60 * 5,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-orange-100 text-orange-800";
      case "ready":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Order Placed";
      case "confirmed":
        return "Confirmed";
      case "preparing":
        return "Being Prepared";
      case "ready":
        return "Ready for Pickup";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("POST", `/api/orders/reorder`, { orderId });
    },
    onSuccess: (data: any) => {
      // Check if cart has items from different restaurant
      const hasItemsFromDifferentRestaurant = cartItems.length > 0 && 
        cartItems.some(item => item.restaurantId !== data.restaurantInfo.id);
      
      if (hasItemsFromDifferentRestaurant) {
        if (window.confirm(
          `Your cart contains items from a different restaurant. Do you want to clear your cart and add items from ${data.restaurantInfo.name}?`
        )) {
          clearCart();
          data.cartItems.forEach((item: any) => addToCart(item));
          toast({
            title: "Items added to cart",
            description: `Previous order items from ${data.restaurantInfo.name} have been added to your cart.`,
          });
        }
      } else {
        // Add items to cart
        data.cartItems.forEach((item: any) => addToCart(item));
        toast({
          title: "Items added to cart",
          description: `Previous order items from ${data.restaurantInfo.name} have been added to your cart.`,
        });
      }
    },
    onError: () => {
      toast({
        title: "Failed to reorder",
        description: "Some items may no longer be available. Please try adding items manually.",
        variant: "destructive",
      });
    },
  });

  const handleReorder = () => {
    if (!order?.id) return;
    reorderMutation.mutate(order.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <title>Order Details - West Row Kitchen</title>
      <meta name="description" content="View detailed information about your food delivery order on West Row Kitchen." />
      
      <NavigationHeader />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/orders">
          <Button variant="ghost" className="mb-6" data-testid="button-back-to-orders">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
              <p className="text-lg text-muted-foreground">Loading order details...</p>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load order details. Please try again.
            </AlertDescription>
            <div className="mt-3">
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                size="sm"
                data-testid="button-retry-order-detail"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </Alert>
        )}

        {order && (
          <div className="space-y-6">
            {/* Order Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl" data-testid="text-order-number">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <p className="text-gray-600">
                      Placed on {new Date(order.createdAt!).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)} data-testid="badge-order-status">
                    {getStatusText(order.status)}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items && order.items.length > 0 ? (
                    <>
                      {order.items.map((item: any, index: number) => {
                        const foodImage = getFoodImage(item.menuItem.name);
                        return (
                          <div key={item.id} className="flex justify-between items-start py-3 border-b last:border-b-0" data-testid={`order-item-${index}`}>
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {foodImage ? (
                                  <img 
                                    src={foodImage} 
                                    alt={item.menuItem.name}
                                    className="w-full h-full object-cover"
                                    data-testid={`img-food-item-${index}`}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Utensils className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium" data-testid={`item-name-${index}`}>{item.menuItem.name}</h4>
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                {item.specialInstructions && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">Special instructions:</span> {item.specialInstructions}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium" data-testid={`item-total-${index}`}>${parseFloat(item.totalPrice).toFixed(2)}</p>
                              <p className="text-sm text-gray-600">${parseFloat(item.unitPrice).toFixed(2)} each</p>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="flex justify-between items-center py-3 border-b">
                      <div>
                        <h4 className="font-medium">Order Total</h4>
                        <p className="text-sm text-gray-600">Individual items not available</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${parseFloat(order.totalAmount).toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium" data-testid="text-customer-name">
                        {order.customerName || 'Customer'}
                      </h4>
                      <p className="text-sm text-gray-600">Order Customer</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {order.customerEmail && (
                      <div className="flex items-center space-x-2 text-sm" data-testid="text-customer-email">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{order.customerEmail}</span>
                      </div>
                    )}
                    
                    {order.customerPhone && (
                      <div className="flex items-center space-x-2 text-sm" data-testid="text-customer-phone">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{order.customerPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center text-sm font-medium text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Delivery Address</span>
                    </div>
                    <p className="text-sm mb-4">{order.deliveryAddress}</p>
                    
                    {order.deliveryInstructions && (
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">Delivery Instructions:</div>
                        <p className="text-sm">{order.deliveryInstructions}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    {order.estimatedDeliveryTime && (
                      <div className="mb-4">
                        <div className="flex items-center text-sm font-medium text-gray-600 mb-2">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Estimated Delivery Time</span>
                        </div>
                        <p className="text-sm">
                          {new Date(order.estimatedDeliveryTime).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}

                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${(parseFloat(order.totalAmount) - parseFloat(order.deliveryFee || "0") - parseFloat(order.serviceFee || "0") - parseFloat(order.tax || "0") + parseFloat(order.discountAmount || "0")).toFixed(2)}</span>
                  </div>
                  {order.appliedCoupon && parseFloat(order.discountAmount || "0") > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Coupon Discount ({order.appliedCoupon.code}):</span>
                      <span>-${parseFloat(order.discountAmount || "0").toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee:</span>
                    <span>${parseFloat(order.deliveryFee || "0").toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Service Fee:</span>
                    <span>${parseFloat(order.serviceFee || "0").toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>${parseFloat(order.tax || "0").toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleReorder}
                disabled={reorderMutation.isPending}
                data-testid="button-reorder"
              >
                <Package className="w-4 h-4 mr-2" />
                {reorderMutation.isPending ? "Adding to Cart..." : "Reorder Items"}
              </Button>
              <Button variant="outline" className="flex-1" data-testid="button-contact-support">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}