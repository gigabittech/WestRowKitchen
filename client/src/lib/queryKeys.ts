// Query Key Factory for consistent cache management
export const queryKeys = {
  // User related queries
  user: () => ["user"] as const,
  
  // Orders related queries  
  orders: {
    all: () => ["orders"] as const,
    byUser: (userId: string) => ["orders", userId] as const,
    byId: (orderId: string) => ["orders", "detail", orderId] as const,
  },
  
  // Restaurants related queries
  restaurants: {
    all: () => ["restaurants"] as const,
    byId: (restaurantId: string) => ["restaurants", restaurantId] as const,
    menu: (restaurantId: string) => ["restaurants", restaurantId, "menu"] as const,
    stats: (restaurantId: string) => ["restaurants", restaurantId, "stats"] as const,
    orders: (restaurantId: string) => ["restaurants", restaurantId, "orders"] as const,
  },
  
  // Coupons related queries
  coupons: {
    all: () => ["coupons"] as const,
    validate: (code: string, restaurantId: string, amount: number) => 
      ["coupons", "validate", code, restaurantId, amount] as const,
  },
  
  // Promotions
  promotions: {
    all: () => ["promotions"] as const,
    active: () => ["promotions", "active"] as const,
  },
} as const;

// Cache invalidation utilities
export const cacheUtils = {
  // Invalidate all user orders
  invalidateUserOrders: (queryClient: any, userId?: string) => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.byUser(userId) });
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
    }
  },
  
  // Invalidate restaurant data
  invalidateRestaurant: (queryClient: any, restaurantId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.byId(restaurantId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.stats(restaurantId) });
  },
  
  // Invalidate restaurant menu
  invalidateRestaurantMenu: (queryClient: any, restaurantId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.menu(restaurantId) });
  },
  
  // Smart order invalidation - affects related data
  invalidateOrderCreation: (queryClient: any, order: { restaurantId: string; userId?: string }) => {
    // Invalidate user orders
    cacheUtils.invalidateUserOrders(queryClient, order.userId);
    
    // Invalidate restaurant orders and stats
    queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.orders(order.restaurantId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.stats(order.restaurantId) });
    
    // Refresh general restaurant list (for order counts, ratings, etc.)
    queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all() });
  },
} as const;