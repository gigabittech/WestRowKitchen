import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, ShoppingCart, Users, DollarSign } from "lucide-react";
import type { Restaurant, Order, User, Coupon } from "@shared/schema";

interface AdminStatsProps {
  restaurants: Restaurant[];
  orders: Order[];
  users: User[];
  coupons: Coupon[];
}

export default function AdminStats({ restaurants, orders, users, coupons }: AdminStatsProps) {
  const stats = {
    totalRestaurants: restaurants.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum: number, order: Order) => sum + parseFloat(order.totalAmount), 0),
    activeOrders: orders.filter((order: Order) => ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)).length,
    totalUsers: users.length,
    activeCoupons: coupons.filter((coupon: Coupon) => coupon.isActive).length
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
          <Store className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="stat-total-restaurants">
            {stats.totalRestaurants}
          </div>
          <p className="text-xs text-muted-foreground">
            Active restaurant partners
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="stat-total-orders">
            {stats.totalOrders}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.activeOrders} currently active
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="stat-total-users">
            {stats.totalUsers}
          </div>
          <p className="text-xs text-muted-foreground">
            Registered customers
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="stat-total-revenue">
            ${stats.totalRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.activeCoupons} active coupons
          </p>
        </CardContent>
      </Card>
    </div>
  );
}