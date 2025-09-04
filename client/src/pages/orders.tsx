import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryKeys } from "@/lib/queryKeys";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import NavigationHeader from "@/components/navigation-header";
import { Clock, MapPin, Package, ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@shared/schema";

export default function Orders() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Orders query with proper dependency management and typing
  const { 
    data: orders = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery<Order[]>({
    queryKey: queryKeys.orders.all(),
    enabled: !!user?.id, // Only run when user is authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true, // Refresh when user comes back to tab
  });

  // Cancel order mutation with optimistic updates
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("PATCH", `/api/orders/${orderId}`, { status: "cancelled" });
    },
    onMutate: async (orderId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.all() });
      
      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData<Order[]>(queryKeys.orders.all());
      
      // Optimistically update to the new value
      queryClient.setQueryData<Order[]>(queryKeys.orders.all(), (old) => 
        old?.map(order => 
          order.id === orderId ? { ...order, status: "cancelled" } : order
        ) || []
      );
      
      return { previousOrders };
    },
    onError: (err, orderId, context) => {
      // Rollback on error
      if (context?.previousOrders) {
        queryClient.setQueryData(queryKeys.orders.all(), context.previousOrders);
      }
      toast({
        title: "Failed to cancel order",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Order cancelled",
        description: "Your order has been successfully cancelled.",
      });
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
    },
  });

  // Reorder mutation with cache management
  const reorderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("POST", `/api/orders/reorder`, { orderId });
    },
    onSuccess: () => {
      toast({
        title: "Items added to cart",
        description: "Previous order items have been added to your cart.",
      });
      // Invalidate related caches
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
    },
    onError: () => {
      toast({
        title: "Failed to reorder",
        description: "Please try adding items manually.",
        variant: "destructive",
      });
    },
  });

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  const handleReorder = (orderId: string) => {
    reorderMutation.mutate(orderId);
  };

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

  return (
    <div className="min-h-screen bg-background">
      <title>My Orders - West Row Kitchen</title>
      <meta name="description" content="Track your food delivery orders and view order history on West Row Kitchen." />
      
      <NavigationHeader />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Orders</h1>
            <p className="text-gray-600">Track your current and past orders</p>
          </div>
        </div>

        {authLoading || isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-32"></div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load orders. Please try again.</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="ml-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start exploring restaurants to place your first order!
            </p>
            <Link href="/">
              <Button className="btn-primary">
                Browse Restaurants
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow" data-testid={`card-order-${order.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt!).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>Delivery Address</span>
                      </div>
                      <p className="text-sm font-medium mb-4">
                        {order.deliveryAddress}
                      </p>
                      
                      {order.deliveryInstructions && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Delivery Instructions:</div>
                          <p className="text-sm">{order.deliveryInstructions}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary mb-2">
                        ${parseFloat(order.totalAmount).toFixed(2)}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${(parseFloat(order.totalAmount) - parseFloat(order.deliveryFee || "0") - parseFloat(order.serviceFee || "0") - parseFloat(order.tax || "0")).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Fee:</span>
                          <span>${parseFloat(order.deliveryFee || "0").toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service Fee:</span>
                          <span>${parseFloat(order.serviceFee || "0").toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>${parseFloat(order.tax || "0").toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {order.estimatedDeliveryTime && (
                        <div className="flex items-center justify-end text-sm text-gray-500 mt-3">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>
                            Est. delivery: {new Date(order.estimatedDeliveryTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="flex space-x-2">
                      {order.status === "delivered" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReorder(order.id)}
                          disabled={reorderMutation.isPending}
                          data-testid={`button-reorder-${order.id}`}
                        >
                          {reorderMutation.isPending ? "Adding..." : "Reorder"}
                        </Button>
                      )}
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm" data-testid={`button-view-details-${order.id}`}>
                          View Details
                        </Button>
                      </Link>
                    </div>
                    
                    {["pending", "confirmed", "preparing"].includes(order.status) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancelOrderMutation.isPending}
                        data-testid={`button-cancel-${order.id}`}
                      >
                        {cancelOrderMutation.isPending ? "Cancelling..." : "Cancel Order"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
