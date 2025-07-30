import {
  users,
  restaurants,
  menuCategories,
  menuItems,
  orders,
  orderItems,
  promotions,
  type User,
  type UpsertUser,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Restaurant operations
  getRestaurants(cuisine?: string): Promise<Restaurant[]>;
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: string, restaurant: Partial<InsertRestaurant>): Promise<Restaurant>;
  deleteRestaurant(id: string): Promise<void>;

  // Menu operations
  getMenuCategories(restaurantId: string): Promise<MenuCategory[]>;
  createMenuCategory(category: InsertMenuCategory): Promise<MenuCategory>;
  getMenuItems(restaurantId: string, categoryId?: string): Promise<MenuItem[]>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, item: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: string): Promise<void>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]>;
  getUserOrders(userId: string): Promise<Order[]>;
  getRestaurantOrders(restaurantId: string): Promise<Order[]>;
  updateOrderStatus(orderId: string, status: string): Promise<Order>;

  // Promotion operations
  getActivePromotions(restaurantId?: string): Promise<Promotion[]>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;

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

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
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
}

export const storage = new DatabaseStorage();
