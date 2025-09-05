import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { sendOrderConfirmationEmail, sendOrderStatusEmail, testEmailConnection } from "./email";

// Middleware to check if user is authenticated
const isAuthenticated = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
import { 
  insertRestaurantSchema,
  insertMenuCategorySchema,
  insertMenuItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertPromotionSchema,
  insertCouponSchema
} from "@shared/schema";
import { z } from "zod";

// Initialize Stripe with test keys for now
let stripe: Stripe | null = null;
try {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_4eC39HqLyjWDarjtT1zdp7dc", {
    apiVersion: "2025-08-27.basil",
  });
} catch (error) {
  console.log("Stripe not configured, payment functionality disabled");
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const assetsDir = path.join(process.cwd(), 'client/public/assets');
      // Ensure assets directory exists
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }
      cb(null, assetsDir);
    },
    filename: (req, file, cb) => {
      // Keep original filename as requested
      cb(null, file.originalname);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Test email connection on startup
  testEmailConnection();

  // Auth routes are now handled in auth.ts

  // Restaurant routes
  app.get("/api/restaurants", async (req, res) => {
    try {
      const { cuisine } = req.query;
      const restaurants = await storage.getRestaurants(cuisine as string);
      res.json(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    try {
      const restaurant = await storage.getRestaurant(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      res.status(500).json({ message: "Failed to fetch restaurant" });
    }
  });

  app.post("/api/restaurants", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const restaurantData = insertRestaurantSchema.parse(req.body);
      const restaurant = await storage.createRestaurant({
        ...restaurantData,
        ownerId: userId,
      });
      res.status(201).json(restaurant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating restaurant:", error);
      res.status(500).json({ message: "Failed to create restaurant" });
    }
  });

  app.put("/api/restaurants/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const restaurantData = insertRestaurantSchema.partial().parse(req.body);
      const restaurant = await storage.updateRestaurant(req.params.id, restaurantData);
      res.json(restaurant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating restaurant:", error);
      res.status(500).json({ message: "Failed to update restaurant" });
    }
  });

  app.delete("/api/restaurants/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteRestaurant(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      res.status(500).json({ message: "Failed to delete restaurant" });
    }
  });

  // Restaurant status management routes
  app.put("/api/restaurants/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { isOpen } = req.body;
      if (typeof isOpen !== 'boolean') {
        return res.status(400).json({ message: "isOpen must be a boolean" });
      }

      const restaurant = await storage.toggleRestaurantStatus(req.params.id, isOpen);
      res.json(restaurant);
    } catch (error) {
      console.error("Error updating restaurant status:", error);
      res.status(500).json({ message: "Failed to update restaurant status" });
    }
  });

  app.put("/api/restaurants/:id/temporary-closure", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { isClosed } = req.body;
      if (typeof isClosed !== 'boolean') {
        return res.status(400).json({ message: "isClosed must be a boolean" });
      }

      const restaurant = await storage.setTemporaryClosure(req.params.id, isClosed);
      res.json(restaurant);
    } catch (error) {
      console.error("Error updating temporary closure:", error);
      res.status(500).json({ message: "Failed to update temporary closure" });
    }
  });

  app.put("/api/restaurants/:id/operating-hours", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { operatingHours } = req.body;
      const restaurant = await storage.updateOperatingHours(req.params.id, operatingHours);
      res.json(restaurant);
    } catch (error) {
      console.error("Error updating operating hours:", error);
      res.status(500).json({ message: "Failed to update operating hours" });
    }
  });

  app.put("/api/restaurants/:id/special-hours", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { specialHours } = req.body;
      const restaurant = await storage.updateSpecialHours(req.params.id, specialHours);
      res.json(restaurant);
    } catch (error) {
      console.error("Error updating special hours:", error);
      res.status(500).json({ message: "Failed to update special hours" });
    }
  });

  app.get("/api/restaurants/:id/status", async (req, res) => {
    try {
      const status = await storage.getRestaurantStatus(req.params.id);
      res.json(status);
    } catch (error) {
      console.error("Error fetching restaurant status:", error);
      res.status(500).json({ message: "Failed to fetch restaurant status" });
    }
  });

  // Logo upload endpoint
  app.post("/api/upload/logo", isAuthenticated, upload.single('logo'), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Return just the filename (not the full path)
      res.json({ 
        success: true,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ message: "Failed to upload logo" });
    }
  });

  // Menu item image upload endpoint
  app.post("/api/upload/menu-item-image", isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { restaurantId, type } = req.body;
      let filePath: string;

      if (restaurantId && type === 'menu-item') {
        // Organize menu item images by restaurant
        const restaurantDir = path.join(process.cwd(), 'client', 'public', 'assets', restaurantId);
        
        // Create restaurant directory if it doesn't exist
        if (!fs.existsSync(restaurantDir)) {
          fs.mkdirSync(restaurantDir, { recursive: true });
        }

        // Move file to restaurant directory
        const newFileName = `${Date.now()}_${req.file.originalname}`;
        const newFilePath = path.join(restaurantDir, newFileName);
        fs.renameSync(req.file.path, newFilePath);
        
        filePath = `/assets/${restaurantId}/${newFileName}`;
      } else {
        // Default path for other images
        filePath = `/assets/${req.file.filename}`;
      }

      res.json({ 
        success: true,
        filePath,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Error uploading menu item image:", error);
      res.status(500).json({ message: "Failed to upload menu item image" });
    }
  });

  // Logo delete endpoint
  app.delete("/api/upload/logo/:filename", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), 'client', 'public', 'assets', filename);
      
      // Check if file exists and delete it
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true, message: "File deleted successfully" });
      } else {
        res.status(404).json({ message: "File not found" });
      }
    } catch (error) {
      console.error("Error deleting logo:", error);
      res.status(500).json({ message: "Failed to delete logo" });
    }
  });

  // Menu routes
  app.get("/api/restaurants/:id/categories", async (req, res) => {
    try {
      const categories = await storage.getMenuCategories(req.params.id);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching menu categories:", error);
      res.status(500).json({ message: "Failed to fetch menu categories" });
    }
  });

  app.post("/api/restaurants/:id/categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categoryData = insertMenuCategorySchema.parse({
        ...req.body,
        restaurantId: req.params.id,
      });
      const category = await storage.createMenuCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating menu category:", error);
      res.status(500).json({ message: "Failed to create menu category" });
    }
  });

  app.get("/api/restaurants/:id/menu", async (req, res) => {
    try {
      const { categoryId } = req.query;
      const menuItems = await storage.getMenuItems(req.params.id, categoryId as string);
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.post("/api/restaurants/:id/menu", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const itemData = insertMenuItemSchema.parse({
        ...req.body,
        restaurantId: req.params.id,
      });
      const item = await storage.createMenuItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.put("/api/menu/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const itemData = insertMenuItemSchema.partial().parse(req.body);
      const item = await storage.updateMenuItem(req.params.id, itemData);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating menu item:", error);
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete("/api/menu/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteMenuItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // Order routes
  app.post("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const orderSchema = insertOrderSchema.extend({
        items: z.array(insertOrderItemSchema.omit({ orderId: true })),
      });
      
      // Create a safer schema that explicitly includes all needed fields
      const safeOrderSchema = z.object({
        userId: z.string(),
        restaurantId: z.string(),
        status: z.string().default("pending"),
        totalAmount: z.string(),
        deliveryFee: z.string().optional(),
        serviceFee: z.string().optional(),
        tax: z.string().optional(),
        discountAmount: z.string().optional(),
        couponCode: z.string().nullable().optional(),
        promotionId: z.string().nullable().optional(),
        customerName: z.string(),
        customerEmail: z.string(),
        customerPhone: z.string(),
        deliveryAddress: z.string(),
        deliveryInstructions: z.string().optional(),
        estimatedDeliveryTime: z.string().nullable().optional(),
        actualDeliveryTime: z.string().nullable().optional(),
        items: z.array(insertOrderItemSchema.omit({ orderId: true })),
      });
      
      const { items, ...orderData } = safeOrderSchema.parse({
        ...req.body,
        userId,
      });
      

      const order = await storage.createOrder(orderData);
      
      const orderItems = await storage.createOrderItems(
        items.map(item => ({ ...item, orderId: order.id }))
      );

      // Track coupon usage if a coupon was applied
      if (orderData.couponCode) {
        try {
          const coupon = await storage.getCouponByCode(orderData.couponCode);
          if (coupon) {
            await storage.applyCoupon(coupon.id, userId, order.id);
          }
        } catch (couponError) {
          console.error('Failed to track coupon usage:', couponError);
          // Don't fail the order if coupon tracking fails
        }
      }

      // Send order confirmation email
      try {
        const user = await storage.getUser(userId);
        const restaurant = await storage.getRestaurant(orderData.restaurantId);
        
        if (user && restaurant) {
          const orderWithItems = {
            ...order,
            items: orderItems,
            subtotal: orderItems.reduce((sum: number, item: any) => sum + (parseFloat(item.unitPrice) * item.quantity), 0),
            deliveryFee: 2.99,
            serviceFee: 0,
            tax: 0,
            total: orderItems.reduce((sum: number, item: any) => sum + (parseFloat(item.unitPrice) * item.quantity), 0) + 2.99
          };
          
          await sendOrderConfirmationEmail(orderWithItems, restaurant, user);
        }
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
      }

      res.status(201).json({ order, items: orderItems });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get individual order by ID
  app.get("/api/orders/detail/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user owns this order or is admin
      const user = await storage.getUser(userId);
      if (order.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get order items with menu item details
      const orderItems = await storage.getOrderItemsWithDetails(orderId);
      
      // Get applied coupon if any
      const appliedCoupon = await storage.getOrderCoupon(orderId);
      
      res.json({ ...order, items: orderItems, appliedCoupon });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.get("/api/restaurants/:id/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const orders = await storage.getRestaurantOrders(req.params.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching restaurant orders:", error);
      res.status(500).json({ message: "Failed to fetch restaurant orders" });
    }
  });

  app.put("/api/orders/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status } = z.object({ status: z.string() }).parse(req.body);
      const order = await storage.updateOrderStatus(req.params.id, status);
      
      // Send order status update email
      try {
        if (order) {
          const orderUser = await storage.getUser(order.userId);
          const restaurant = await storage.getRestaurant(order.restaurantId);
          
          if (orderUser && restaurant) {
            await sendOrderStatusEmail(order, restaurant, orderUser, status);
          }
        }
      } catch (emailError) {
        console.error('Failed to send order status email:', emailError);
      }
      
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Customer order cancellation endpoint
  app.patch("/api/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      const { status } = req.body;

      // Check if user owns this order
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // For customer cancellations, only allow if order is pending
      if (status === "cancelled") {
        if (order.status !== "pending") {
          return res.status(400).json({ 
            message: "Orders can only be cancelled while pending" 
          });
        }
      } else {
        return res.status(400).json({ 
          message: "Customers can only cancel orders" 
        });
      }

      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Search endpoint for both restaurants and food items
  app.get("/api/search", async (req, res) => {
    try {
      const { q: query } = req.query;
      
      if (!query || typeof query !== 'string' || query.length < 2) {
        return res.json({ restaurants: [], menuItems: [] });
      }

      // Search restaurants
      const restaurants = await storage.getRestaurants();
      const searchTerm = query.toLowerCase();
      const filteredRestaurants = restaurants.filter((restaurant) => 
        restaurant.name.toLowerCase().includes(searchTerm) ||
        restaurant.cuisine.toLowerCase().includes(searchTerm) ||
        (restaurant.description && restaurant.description.toLowerCase().includes(searchTerm))
      ).slice(0, 5);

      // Search menu items
      const menuItems = await storage.searchMenuItems(query);

      res.json({
        restaurants: filteredRestaurants,
        menuItems: menuItems.slice(0, 5)
      });
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ message: "Failed to search" });
    }
  });

  // Reorder endpoint
  app.post("/api/orders/reorder", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }

      // Get the original order with items
      const orderDetail = await storage.getOrderById(orderId);
      
      if (!orderDetail || orderDetail.userId !== userId) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Get order items with details
      const orderItems = await storage.getOrderItemsWithDetails(orderId);

      // Check if the restaurant is still active
      const restaurant = await storage.getRestaurant(orderDetail.restaurantId);
      if (!restaurant) {
        return res.status(400).json({ message: "Restaurant is no longer available" });
      }

      // Prepare cart items from order items
      const cartItems = orderItems?.map((item: any) => ({
        id: item.menuItem.id,
        name: item.menuItem.name,
        price: parseFloat(item.unitPrice),
        quantity: item.quantity,
        restaurantId: orderDetail.restaurantId,
        restaurantName: restaurant.name,
        description: item.menuItem.description || "",
        category: item.menuItem.category || "Unknown"
      })) || [];

      res.json({ 
        success: true, 
        message: "Items ready to be added to cart",
        cartItems,
        restaurantInfo: {
          id: restaurant.id,
          name: restaurant.name
        }
      });

    } catch (error) {
      console.error("Error processing reorder:", error);
      res.status(500).json({ message: "Failed to process reorder" });
    }
  });

  // Promotion routes
  app.get("/api/promotions", async (req, res) => {
    try {
      const { restaurantId } = req.query;
      const promotions = await storage.getActivePromotions(restaurantId as string);
      res.json(promotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      res.status(500).json({ message: "Failed to fetch promotions" });
    }
  });

  app.post("/api/promotions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const promotionData = insertPromotionSchema.parse(req.body);
      const promotion = await storage.createPromotion(promotionData);
      res.status(201).json(promotion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating promotion:", error);
      res.status(500).json({ message: "Failed to create promotion" });
    }
  });

  // Coupon routes
  app.get("/api/coupons", async (req, res) => {
    try {
      const { restaurantId } = req.query;
      const coupons = await storage.getActiveCoupons(restaurantId as string);
      res.json(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, restaurantId, orderAmount } = req.body;
      
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not found" });
      }

      const validation = await storage.validateCoupon(code, userId, restaurantId, orderAmount);
      
      if (!validation.valid) {
        return res.status(400).json({ 
          valid: false, 
          error: validation.error 
        });
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (validation.coupon) {
        const coupon = validation.coupon;
        if (coupon.discountType === "percentage") {
          discountAmount = orderAmount * (parseFloat(coupon.discountValue || "0") / 100);
        } else if (coupon.discountType === "fixed") {
          discountAmount = parseFloat(coupon.discountValue || "0");
        } else if (coupon.discountType === "free_delivery") {
          // This will be handled in the frontend by removing delivery fee
          discountAmount = 0;
        }
      }

      res.json({
        valid: true,
        coupon: validation.coupon,
        discountAmount: discountAmount.toFixed(2)
      });
    } catch (error) {
      console.error("Error validating coupon:", error);
      res.status(500).json({ message: "Failed to validate coupon" });
    }
  });

  app.post("/api/coupons/apply", isAuthenticated, async (req, res) => {
    try {
      const { couponId, orderId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not found" });
      }

      const usage = await storage.applyCoupon(couponId, userId, orderId);
      res.json(usage);
    } catch (error) {
      console.error("Error applying coupon:", error);
      res.status(500).json({ message: "Failed to apply coupon" });
    }
  });

  // Admin coupon management
  app.post("/api/admin/coupons", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const couponData = insertCouponSchema.parse(req.body);
      const coupon = await storage.createCoupon(couponData);
      res.status(201).json(coupon);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating coupon:", error);
      res.status(500).json({ message: "Failed to create coupon" });
    }
  });

  app.get("/api/admin/coupons", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  app.put("/api/admin/coupons/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const couponData = insertCouponSchema.partial().parse(req.body);
      const coupon = await storage.updateCoupon(req.params.id, couponData);
      res.json(coupon);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating coupon:", error);
      res.status(500).json({ message: "Failed to update coupon" });
    }
  });

  app.delete("/api/admin/coupons/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteCoupon(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });

  // User management for admins
  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin orders endpoint
  app.get("/api/admin/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.put("/api/admin/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { isAdmin } = req.body;
      const updatedUser = await storage.updateUserRole(req.params.id, isAdmin);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Analytics routes
  app.get("/api/restaurants/:id/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getRestaurantStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching restaurant stats:", error);
      res.status(500).json({ message: "Failed to fetch restaurant stats" });
    }
  });

  // Object storage routes
  const { ObjectStorageService } = await import("./objectStorage");
  
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      return res.sendStatus(404);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const { restaurantId, fileName, type } = req.body;
    
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL(restaurantId, fileName, type);
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe not configured. Please set STRIPE_SECRET_KEY environment variable." });
      }

      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
