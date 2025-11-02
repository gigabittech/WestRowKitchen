import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { DoorDashCheckoutService } from './checkout.js';
import type { DoorDashCheckoutRequest } from './types.js';

const checkoutService = new DoorDashCheckoutService({
  apiKey: process.env.DOORDASH_API_KEY || '',
  apiSecret: process.env.DOORDASH_API_SECRET || '',
  merchantId: process.env.DOORDASH_MERCHANT_ID || '',
  baseUrl: process.env.DOORDASH_BASE_URL || 'https://openapi.doordash.com',
  webhookSecret: process.env.DOORDASH_WEBHOOK_SECRET || '',
});

export function setupDoorDashCheckoutRoutes(app: Express) {
  /**
   * Create DoorDash checkout session
   * POST /api/checkout/doordash/session
   */
  app.post('/api/checkout/doordash/session', async (req: Request, res: Response) => {
    try {
      const checkoutRequestSchema = z.object({
        orderId: z.string(),
        restaurantId: z.string(),
        customerId: z.string(),
        customerName: z.string(),
        customerEmail: z.string().email(),
        customerPhone: z.string(),
        deliveryAddress: z.object({
          street: z.string(),
          city: z.string(),
          state: z.string(),
          zipCode: z.string(),
          instructions: z.string().optional(),
        }),
        items: z.array(z.object({
          name: z.string(),
          description: z.string().optional(),
          quantity: z.number().positive(),
          price: z.number().positive(),
          category: z.string().optional(),
        })),
        subtotal: z.number().positive(),
        deliveryFee: z.number().min(0),
        serviceFee: z.number().min(0),
        tax: z.number().min(0),
        total: z.number().positive(),
        estimatedPickupTime: z.string(),
        estimatedDeliveryTime: z.string(),
        specialInstructions: z.string().optional(),
      });

      const checkoutData = checkoutRequestSchema.parse(req.body);

      console.log('🚀 Creating DoorDash checkout session for order:', checkoutData.orderId);

      const checkoutResponse = await checkoutService.createCheckoutSession(checkoutData);

      res.json({
        success: true,
        data: checkoutResponse,
      });

    } catch (error: any) {
      console.error('❌ DoorDash checkout session creation failed:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: error.errors,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create checkout session',
      });
    }
  });

  /**
   * Get DoorDash order status
   * GET /api/checkout/doordash/order/:orderId/status
   */
  app.get('/api/checkout/doordash/order/:orderId/status', async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required',
        });
      }

      console.log('📊 Getting DoorDash order status for:', orderId);

      const orderStatus = await checkoutService.getOrderStatus(orderId);

      res.json({
        success: true,
        data: orderStatus,
      });

    } catch (error: any) {
      console.error('❌ Failed to get DoorDash order status:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get order status',
      });
    }
  });

  /**
   * Cancel DoorDash order
   * POST /api/checkout/doordash/order/:orderId/cancel
   */
  app.post('/api/checkout/doordash/order/:orderId/cancel', async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required',
        });
      }

      console.log('❌ Cancelling DoorDash order:', orderId);

      const success = await checkoutService.cancelOrder(orderId, reason);

      res.json({
        success,
        message: success ? 'Order cancelled successfully' : 'Failed to cancel order',
      });

    } catch (error: any) {
      console.error('❌ Failed to cancel DoorDash order:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to cancel order',
      });
    }
  });

  /**
   * DoorDash webhook handler for order updates
   * POST /api/checkout/doordash/webhook
   */
  app.post('/api/checkout/doordash/webhook', async (req: Request, res: Response) => {
    try {
      const signature = req.headers['x-doordash-signature'] as string;
      const payload = JSON.stringify(req.body);

      // Verify webhook signature
      if (!checkoutService.verifyWebhookSignature(payload, signature)) {
        console.error('❌ Invalid DoorDash webhook signature');
        return res.status(401).json({
          success: false,
          message: 'Invalid signature',
        });
      }

      const webhookData = req.body;
      console.log('🔔 DoorDash webhook received:', webhookData);

      // Handle different webhook events
      switch (webhookData.event_type) {
        case 'order.created':
          await handleOrderCreated(webhookData);
          break;
        case 'order.updated':
          await handleOrderUpdated(webhookData);
          break;
        case 'order.cancelled':
          await handleOrderCancelled(webhookData);
          break;
        case 'payment.completed':
          await handlePaymentCompleted(webhookData);
          break;
        case 'payment.failed':
          await handlePaymentFailed(webhookData);
          break;
        case 'delivery.assigned':
          await handleDeliveryAssigned(webhookData);
          break;
        case 'delivery.picked_up':
          await handleDeliveryPickedUp(webhookData);
          break;
        case 'delivery.delivered':
          await handleDeliveryDelivered(webhookData);
          break;
        default:
          console.log('ℹ️ Unhandled webhook event:', webhookData.event_type);
      }

      res.json({ success: true });

    } catch (error: any) {
      console.error('❌ DoorDash webhook processing failed:', error);
      
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
      });
    }
  });
}

// Webhook event handlers
async function handleOrderCreated(webhookData: any) {
  console.log('📦 Order created in DoorDash:', webhookData.order_id);
  // TODO: Sync order to local database
}

async function handleOrderUpdated(webhookData: any) {
  console.log('📝 Order updated in DoorDash:', webhookData.order_id);
  // TODO: Update order status in local database
}

async function handleOrderCancelled(webhookData: any) {
  console.log('❌ Order cancelled in DoorDash:', webhookData.order_id);
  // TODO: Update order status to cancelled in local database
}

async function handlePaymentCompleted(webhookData: any) {
  console.log('💳 Payment completed in DoorDash:', webhookData.order_id);
  // TODO: Update payment status in local database
}

async function handlePaymentFailed(webhookData: any) {
  console.log('💳 Payment failed in DoorDash:', webhookData.order_id);
  // TODO: Update payment status in local database
}

async function handleDeliveryAssigned(webhookData: any) {
  console.log('🚚 Delivery assigned in DoorDash:', webhookData.order_id);
  // TODO: Update delivery status in local database
}

async function handleDeliveryPickedUp(webhookData: any) {
  console.log('📦 Delivery picked up in DoorDash:', webhookData.order_id);
  // TODO: Update delivery status in local database
}

async function handleDeliveryDelivered(webhookData: any) {
  console.log('✅ Delivery completed in DoorDash:', webhookData.order_id);
  // TODO: Update delivery status in local database
}
