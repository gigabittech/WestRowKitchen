import {
  users,
  restaurants,
  menuCategories,
  menuItems,
  orders,
  orderItems,
  promotions,
  coupons,
  couponUsage,
  type User,
  type InsertUser,
  type Restaurant,
  type InsertRestaurant,
  type MenuCategory,
  type InsertMenuCategory,
  type MenuItem,
  type InsertMenuItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Promotion,
  type InsertPromotion,
  type Coupon,
  type InsertCoupon,
  type CouponUsage,
  type InsertCouponUsage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Restaurant operations
  getRestaurants(cuisine?: string): Promise<Restaurant[]>;
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: string, restaurant: Partial<InsertRestaurant>): Promise<Restaurant>;
  deleteRestaurant(id: string): Promise<void>;
  
  // Restaurant status operations
  toggleRestaurantStatus(id: string, isOpen: boolean): Promise<Restaurant>;
  setTemporaryClosure(id: string, isClosed: boolean): Promise<Restaurant>;
  updateOperatingHours(id: string, operatingHours: any): Promise<Restaurant>;
  updateSpecialHours(id: string, specialHours: any): Promise<Restaurant>;
  getRestaurantStatus(id: string): Promise<{
    isOpen: boolean;
    isTemporarilyClosed: boolean;
    currentStatus: 'open' | 'closed' | 'temp_closed';
    nextStatusChange?: string;
  }>;

  // Menu operations
  getMenuCategories(restaurantId: string): Promise<MenuCategory[]>;
  createMenuCategory(category: InsertMenuCategory): Promise<MenuCategory>;
  updateMenuCategory(id: string, category: Partial<InsertMenuCategory>): Promise<MenuCategory>;
  getMenuItems(restaurantId: string, categoryId?: string): Promise<MenuItem[]>;
  getMenuItemById(id: string): Promise<MenuItem | undefined>;
  searchMenuItems(query: string): Promise<(MenuItem & { restaurant: Restaurant })[]>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, item: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: string): Promise<void>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]>;
  getUserOrders(userId: string): Promise<Order[]>;
  getOrderById(orderId: string): Promise<Order | null>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  getOrderItemsWithDetails(orderId: string): Promise<any[]>;
  getRestaurantOrders(restaurantId: string): Promise<Order[]>;
  updateOrderStatus(orderId: string, status: string): Promise<Order>;

  // Promotion operations
  getActivePromotions(restaurantId?: string): Promise<Promotion[]>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;

  // Coupon operations
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  validateCoupon(code: string, userId: string, restaurantId: string, orderAmount: number): Promise<{
    valid: boolean;
    coupon?: Coupon;
    error?: string;
  }>;
  applyCoupon(couponId: string, userId: string, orderId?: string): Promise<CouponUsage>;
  getCouponUsageCount(couponId: string, userId: string): Promise<number>;
  updateCouponUsage(couponId: string, increment: number): Promise<void>;
  getActiveCoupons(restaurantId?: string): Promise<Coupon[]>;

  // Order-coupon operations
  getOrderCoupon(orderId: string): Promise<Coupon | null>;

  // Analytics
  getRestaurantStats(restaurantId: string): Promise<{
    totalOrders: number;
    totalRevenue: string;
    averageOrderValue: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Restaurant operations
  async getRestaurants(cuisine?: string): Promise<Restaurant[]> {
    if (cuisine && cuisine !== 'ALL') {
      return await db
        .select()
        .from(restaurants)
        .where(like(restaurants.cuisine, `%${cuisine}%`))
        .orderBy(desc(restaurants.rating));
    }
    
    return await db
      .select()
      .from(restaurants)
      .orderBy(desc(restaurants.rating));
  }

  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant;
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const [newRestaurant] = await db
      .insert(restaurants)
      .values(restaurant)
      .returning();
    return newRestaurant;
  }

  async updateRestaurant(id: string, restaurant: Partial<InsertRestaurant>): Promise<Restaurant> {
    const [updated] = await db
      .update(restaurants)
      .set({ ...restaurant, updatedAt: new Date() })
      .where(eq(restaurants.id, id))
      .returning();
    return updated;
  }

  async deleteRestaurant(id: string): Promise<void> {
    await db.delete(restaurants).where(eq(restaurants.id, id));
  }

  // Restaurant status management
  async toggleRestaurantStatus(id: string, isOpen: boolean): Promise<Restaurant> {
    const [updated] = await db
      .update(restaurants)
      .set({ 
        isOpen, 
        updatedAt: new Date(),
        // Reset temporary closure when manually changing status
        isTemporarilyClosed: false 
      })
      .where(eq(restaurants.id, id))
      .returning();
    
    if (!updated) {
      throw new Error('Restaurant not found');
    }
    
    return updated;
  }

  async setTemporaryClosure(id: string, isClosed: boolean): Promise<Restaurant> {
    const [updated] = await db
      .update(restaurants)
      .set({ 
        isTemporarilyClosed: isClosed,
        updatedAt: new Date()
      })
      .where(eq(restaurants.id, id))
      .returning();
    
    if (!updated) {
      throw new Error('Restaurant not found');
    }
    
    return updated;
  }

  async updateOperatingHours(id: string, operatingHours: any): Promise<Restaurant> {
    const [updated] = await db
      .update(restaurants)
      .set({ 
        operatingHours,
        updatedAt: new Date()
      })
      .where(eq(restaurants.id, id))
      .returning();
    
    if (!updated) {
      throw new Error('Restaurant not found');
    }
    
    return updated;
  }

  async updateSpecialHours(id: string, specialHours: any): Promise<Restaurant> {
    const [updated] = await db
      .update(restaurants)
      .set({ 
        specialHours,
        updatedAt: new Date()
      })
      .where(eq(restaurants.id, id))
      .returning();
    
    if (!updated) {
      throw new Error('Restaurant not found');
    }
    
    return updated;
  }

  async getRestaurantStatus(id: string): Promise<{
    isOpen: boolean;
    isTemporarilyClosed: boolean;
    currentStatus: 'open' | 'closed' | 'temp_closed';
    nextStatusChange?: string;
  }> {
    const restaurant = await this.getRestaurant(id);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    // If temporarily closed, always return closed
    if (restaurant.isTemporarilyClosed) {
      return {
        isOpen: false,
        isTemporarilyClosed: true,
        currentStatus: 'temp_closed'
      };
    }

    // If auto-schedule is disabled, use manual isOpen status
    if (!restaurant.autoScheduleEnabled) {
      return {
        isOpen: restaurant.isOpen,
        isTemporarilyClosed: false,
        currentStatus: restaurant.isOpen ? 'open' : 'closed'
      };
    }

    // Calculate status based on operating hours
    const status = this.calculateRestaurantStatus(restaurant);
    return {
      isOpen: status.isCurrentlyOpen,
      isTemporarilyClosed: false,
      currentStatus: status.isCurrentlyOpen ? 'open' : 'closed',
      nextStatusChange: status.nextStatusChange
    };
  }

  private calculateRestaurantStatus(restaurant: Restaurant): {
    isCurrentlyOpen: boolean;
    nextStatusChange?: string;
  } {
    if (!restaurant.operatingHours) {
      // No operating hours set, use manual status
      return { isCurrentlyOpen: restaurant.isOpen };
    }

    const now = new Date();
    const timezone = restaurant.timezone || 'America/New_York';
    
    try {
      // Convert to restaurant timezone
      const restaurantTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
      const dayOfWeek = restaurantTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const currentTime = restaurantTime.getHours() * 60 + restaurantTime.getMinutes();
      
      const operatingHours = restaurant.operatingHours as any;
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todaySchedule = operatingHours[dayNames[dayOfWeek]];
      
      if (!todaySchedule || !todaySchedule.isOpen) {
        return { isCurrentlyOpen: false };
      }
      
      // Parse open and close times
      const [openHour, openMin] = todaySchedule.openTime.split(':').map(Number);
      const [closeHour, closeMin] = todaySchedule.closeTime.split(':').map(Number);
      
      const openTime = openHour * 60 + openMin;
      const closeTime = closeHour * 60 + closeMin;
      
      // Handle overnight restaurants (close time is next day)
      if (closeTime < openTime) {
        // Restaurant is open overnight
        const isCurrentlyOpen = currentTime >= openTime || currentTime <= closeTime;
        return { isCurrentlyOpen };
      } else {
        // Normal operating hours
        const isCurrentlyOpen = currentTime >= openTime && currentTime <= closeTime;
        return { isCurrentlyOpen };
      }
      
    } catch (error) {
      console.error('Error calculating restaurant status:', error);
      // Fallback to manual status
      return { isCurrentlyOpen: restaurant.isOpen };
    }
  }

  // Menu operations
  async getMenuCategories(restaurantId: string): Promise<MenuCategory[]> {
    return await db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.restaurantId, restaurantId))
      .orderBy(asc(menuCategories.sortOrder));
  }

  async createMenuCategory(category: InsertMenuCategory): Promise<MenuCategory> {
    const [newCategory] = await db
      .insert(menuCategories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateMenuCategory(id: string, category: Partial<InsertMenuCategory>): Promise<MenuCategory> {
    const [updatedCategory] = await db
      .update(menuCategories)
      .set(category)
      .where(eq(menuCategories.id, id))
      .returning();
    return updatedCategory;
  }

  async getMenuItems(restaurantId: string, categoryId?: string): Promise<MenuItem[]> {
    if (categoryId) {
      return await db
        .select()
        .from(menuItems)
        .where(and(
          eq(menuItems.restaurantId, restaurantId),
          eq(menuItems.categoryId, categoryId)
        ))
        .orderBy(asc(menuItems.sortOrder));
    }

    return await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.restaurantId, restaurantId))
      .orderBy(asc(menuItems.sortOrder));
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db
      .insert(menuItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updateMenuItem(id: string, item: Partial<InsertMenuItem>): Promise<MenuItem> {
    const [updated] = await db
      .update(menuItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    return updated;
  }

  async deleteMenuItem(id: string): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  async getMenuItemById(id: string): Promise<MenuItem | undefined> {
    const [item] = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id))
      .limit(1);
    return item;
  }

  async searchMenuItems(query: string): Promise<(MenuItem & { restaurant: Restaurant })[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    return await db
      .select({
        id: menuItems.id,
        categoryId: menuItems.categoryId,
        restaurantId: menuItems.restaurantId,
        name: menuItems.name,
        description: menuItems.description,
        price: menuItems.price,
        image: menuItems.image,
        isAvailable: menuItems.isAvailable,
        preparationTime: menuItems.preparationTime,
        sortOrder: menuItems.sortOrder,
        createdAt: menuItems.createdAt,
        updatedAt: menuItems.updatedAt,
        restaurant: {
          id: restaurants.id,
          name: restaurants.name,
          cuisine: restaurants.cuisine,
          description: restaurants.description,
          image: restaurants.image,
          address: restaurants.address,
          phone: restaurants.phone,
          rating: restaurants.rating,
          deliveryTime: restaurants.deliveryTime,
          deliveryFee: restaurants.deliveryFee,
          minimumOrder: restaurants.minimumOrder,
          isOpen: restaurants.isOpen,
          createdAt: restaurants.createdAt,
          updatedAt: restaurants.updatedAt,
        }
      })
      .from(menuItems)
      .innerJoin(restaurants, eq(menuItems.restaurantId, restaurants.id))
      .where(and(
        like(sql`LOWER(${menuItems.name})`, searchTerm),
        eq(menuItems.isAvailable, true),
        eq(restaurants.isOpen, true)
      ))
      .orderBy(asc(menuItems.name))
      .limit(10);
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]> {
    return await db
      .insert(orderItems)
      .values(items)
      .returning();
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getRestaurantOrders(restaurantId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.restaurantId, restaurantId))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    return updated;
  }

  // Promotion operations
  async getActivePromotions(restaurantId?: string): Promise<Promotion[]> {
    if (restaurantId) {
      return await db
        .select()
        .from(promotions)
        .where(and(
          eq(promotions.restaurantId, restaurantId),
          eq(promotions.isActive, true),
          sql`${promotions.startDate} <= NOW()`,
          sql`${promotions.endDate} >= NOW()`
        ));
    }

    return await db
      .select()
      .from(promotions)
      .where(and(
        eq(promotions.isActive, true),
        sql`${promotions.startDate} <= NOW()`,
        sql`${promotions.endDate} >= NOW()`
      ));
  }

  async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
    const [newPromotion] = await db
      .insert(promotions)
      .values(promotion)
      .returning();
    return newPromotion;
  }

  // Order-coupon operations
  async getOrderCoupon(orderId: string): Promise<Coupon | null> {
    const [usage] = await db
      .select()
      .from(couponUsage)
      .innerJoin(coupons, eq(couponUsage.couponId, coupons.id))
      .where(eq(couponUsage.orderId, orderId))
      .limit(1);
    
    return usage?.coupons || null;
  }

  // Analytics
  async getRestaurantStats(restaurantId: string): Promise<{
    totalOrders: number;
    totalRevenue: string;
    averageOrderValue: string;
  }> {
    const [stats] = await db
      .select({
        totalOrders: sql<number>`COUNT(*)`,
        totalRevenue: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)`,
        averageOrderValue: sql<string>`COALESCE(AVG(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(eq(orders.restaurantId, restaurantId));

    return stats || { totalOrders: 0, totalRevenue: "0", averageOrderValue: "0" };
  }

  // Coupon operations
  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
    return coupon;
  }

  async validateCoupon(code: string, userId: string, restaurantId: string, orderAmount: number): Promise<{
    valid: boolean;
    coupon?: Coupon;
    error?: string;
  }> {
    const coupon = await this.getCouponByCode(code);
    
    if (!coupon) {
      return { valid: false, error: "Coupon code not found" };
    }

    if (!coupon.isActive) {
      return { valid: false, error: "Coupon is no longer active" };
    }

    const now = new Date();
    if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
      return { valid: false, error: "Coupon has expired or is not yet valid" };
    }

    // Check restaurant-specific restrictions
    if (coupon.restaurantId && coupon.restaurantId !== restaurantId) {
      return { valid: false, error: "Coupon is not valid for this restaurant" };
    }

    // Check minimum order amount
    if (coupon.minimumOrder && orderAmount < parseFloat(coupon.minimumOrder)) {
      return { valid: false, error: `Minimum order of $${coupon.minimumOrder} required` };
    }

    // Check overall usage limit
    if (coupon.maxUsage && (coupon.currentUsage || 0) >= coupon.maxUsage) {
      return { valid: false, error: "Coupon usage limit reached" };
    }

    // Check per-user usage limit
    if (coupon.userLimit) {
      const userUsageCount = await this.getCouponUsageCount(coupon.id, userId);
      if (userUsageCount >= coupon.userLimit) {
        return { valid: false, error: "You have reached the usage limit for this coupon" };
      }
    }

    return { valid: true, coupon };
  }

  async applyCoupon(couponId: string, userId: string, orderId?: string): Promise<CouponUsage> {
    const [usage] = await db.insert(couponUsage).values({
      couponId,
      userId,
      orderId,
    }).returning();

    // Increment coupon usage count
    await this.updateCouponUsage(couponId, 1);

    return usage;
  }

  async getCouponUsageCount(couponId: string, userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(couponUsage)
      .where(and(eq(couponUsage.couponId, couponId), eq(couponUsage.userId, userId)));
    
    return result.count;
  }

  async updateCouponUsage(couponId: string, increment: number): Promise<void> {
    await db
      .update(coupons)
      .set({ currentUsage: sql`${coupons.currentUsage} + ${increment}` })
      .where(eq(coupons.id, couponId));
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    const result = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    
    return result[0] || null;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  async getOrderItemsWithDetails(orderId: string): Promise<any[]> {
    return await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        menuItemId: orderItems.menuItemId,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        totalPrice: orderItems.totalPrice,
        specialInstructions: orderItems.specialInstructions,
        menuItem: {
          id: menuItems.id,
          name: menuItems.name,
          description: menuItems.description,
          image: menuItems.image,
        },
      })
      .from(orderItems)
      .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, orderId));
  }

  async getActiveCoupons(restaurantId?: string): Promise<Coupon[]> {
    const now = new Date();
    
    if (restaurantId) {
      return await db
        .select()
        .from(coupons)
        .where(
          and(
            eq(coupons.isActive, true),
            sql`${coupons.startDate} <= ${now}`,
            sql`${coupons.endDate} >= ${now}`,
            sql`${coupons.restaurantId} = ${restaurantId} OR ${coupons.restaurantId} IS NULL`
          )
        )
        .orderBy(desc(coupons.createdAt));
    }

    return await db
      .select()
      .from(coupons)
      .where(
        and(
          eq(coupons.isActive, true),
          sql`${coupons.startDate} <= ${now}`,
          sql`${coupons.endDate} >= ${now}`
        )
      )
      .orderBy(desc(coupons.createdAt));
  }

  // Admin coupon management
  async getAllCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [newCoupon] = await db.insert(coupons).values(coupon).returning();
    return newCoupon;
  }

  async updateCoupon(id: string, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const [updatedCoupon] = await db
      .update(coupons)
      .set(coupon)
      .where(eq(coupons.id, id))
      .returning();
    return updatedCoupon;
  }

  async deleteCoupon(id: string): Promise<void> {
    await db.delete(coupons).where(eq(coupons.id, id));
  }

  // User management
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(id: string, isAdmin: boolean): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ isAdmin })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Admin order management
  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }
}

export const storage = new DatabaseStorage();
