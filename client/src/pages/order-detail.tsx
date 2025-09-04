import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import NavigationHeader from "@/components/navigation-header";
import { Clock, MapPin, Package, ArrowLeft, AlertCircle, RefreshCw, Phone, Mail } from "lucide-react";
import { Link, useParams } from "wouter";
import type { Order } from "@shared/schema";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { 
    data: order, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<Order>({
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

        {isLoading ? (
          <div className="space-y-4">
            <div className="bg-gray-200 animate-pulse rounded-lg h-48"></div>
            <div className="bg-gray-200 animate-pulse rounded-lg h-32"></div>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load order details. Please try again.</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="ml-4"
                data-testid="button-retry-order-detail"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : !order ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Order Not Found</h3>
            <p className="text-gray-600 mb-6">
              This order doesn't exist or you don't have permission to view it.
            </p>
            <Link href="/orders">
              <Button className="btn-primary">
                View All Orders
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Order Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
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
                  <div className="flex justify-between items-center py-3 border-b">
                    <div>
                      <h4 className="font-medium">Order Total</h4>
                      <p className="text-sm text-gray-600">Individual items not available</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${parseFloat(order.totalAmount).toFixed(2)}</p>
                    </div>
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
                    <span>${(parseFloat(order.totalAmount) - parseFloat(order.deliveryFee || "0") - parseFloat(order.serviceFee || "0") - parseFloat(order.tax || "0")).toFixed(2)}</span>
                  </div>
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
                  {order.discountAmount && parseFloat(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-${parseFloat(order.discountAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-3">
                  {order.status === "delivered" && (
                    <Button variant="outline" data-testid="button-reorder-detail">
                      Reorder Items
                    </Button>
                  )}
                  {["pending", "confirmed", "preparing"].includes(order.status) && (
                    <Button variant="outline" className="text-red-600 hover:text-red-700" data-testid="button-cancel-detail">
                      Cancel Order
                    </Button>
                  )}
                  <Button variant="outline" data-testid="button-contact-support">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}