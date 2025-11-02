import axios, { AxiosInstance } from 'axios';
import jwt from 'jsonwebtoken';
import type { DoorDashConfig } from './types';

export interface DoorDashCheckoutRequest {
  orderId: string;
  restaurantId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    instructions?: string;
  };
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    price: number; // Price in dollars
    category?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  total: number;
  estimatedPickupTime: string; // ISO string
  estimatedDeliveryTime: string; // ISO string
  specialInstructions?: string;
}

export interface DoorDashCheckoutResponse {
  checkoutUrl: string;
  orderId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentIntentId?: string;
  expiresAt: string;
}

export interface DoorDashOrderStatus {
  orderId: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'picked_up' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  deliveryStatus: 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';
  estimatedPickupTime?: string;
  estimatedDeliveryTime?: string;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  driverInfo?: {
    name: string;
    phone: string;
    vehicleInfo: string;
  };
  trackingUrl?: string;
}

export class DoorDashCheckoutService {
  private client: AxiosInstance;
  private config: DoorDashConfig;

  constructor(config: DoorDashConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WestRowKitchen/1.0',
      },
    });
  }

  private generateJWTToken(): string {
    const accessKey = {
      developer_id: this.config.merchantId,
      key_id: this.config.apiKey,
      signing_secret: this.config.apiSecret
    };

    const data = {
      aud: 'doordash',
      iss: accessKey.developer_id,
      kid: accessKey.key_id,
      exp: Math.floor(Date.now() / 1000 + 300), // 5 minutes from now
      iat: Math.floor(Date.now() / 1000),
    };

    const headers = {
      algorithm: 'HS256',
      header: { 'dd-ver': 'DD-JWT-V1' }
    };

    return jwt.sign(
      data,
      Buffer.from(accessKey.signing_secret, 'base64'),
      headers,
    );
  }

  /**
   * Create a DoorDash checkout session for payment processing
   */
  async createCheckoutSession(request: DoorDashCheckoutRequest): Promise<DoorDashCheckoutResponse> {
    try {
      const token = this.generateJWTToken();
      
      // Check if we're in sandbox mode
      const env = (process.env.DOORDASH_ENV || '').toLowerCase() || "production";
      const isSandbox = env === "sandbox" || /sandbox/i.test(this.config.baseUrl);

      let finalRequest: DoorDashCheckoutRequest = { ...request };

      // Override with sandbox data if needed
      if (isSandbox) {
        finalRequest = {
          ...finalRequest,
          deliveryAddress: {
            street: "185 Berry Street",
            city: "San Francisco", 
            state: "CA",
            zipCode: "94107",
            instructions: "Leave with receptionist"
          },
          customerPhone: "+14155552672",
        };
      }

      const payload = {
        external_order_id: finalRequest.orderId,
        restaurant_id: this.config.merchantId,
        customer: {
          name: finalRequest.customerName,
          email: finalRequest.customerEmail,
          phone: finalRequest.customerPhone,
        },
        delivery_address: {
          street: finalRequest.deliveryAddress.street,
          city: finalRequest.deliveryAddress.city,
          state: finalRequest.deliveryAddress.state,
          zip_code: finalRequest.deliveryAddress.zipCode,
          instructions: finalRequest.deliveryAddress.instructions || "",
        },
        items: finalRequest.items.map(item => ({
          name: item.name,
          description: item.description || "",
          quantity: item.quantity,
          price_cents: Math.round(item.price * 100), // Convert to cents
          category: item.category || "main",
        })),
        pricing: {
          subtotal_cents: Math.round(finalRequest.subtotal * 100),
          delivery_fee_cents: Math.round(finalRequest.deliveryFee * 100),
          service_fee_cents: Math.round(finalRequest.serviceFee * 100),
          tax_cents: Math.round(finalRequest.tax * 100),
          total_cents: Math.round(finalRequest.total * 100),
        },
        timing: {
          estimated_pickup_time: finalRequest.estimatedPickupTime,
          estimated_delivery_time: finalRequest.estimatedDeliveryTime,
        },
        special_instructions: finalRequest.specialInstructions || "",
        return_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/doordash-checkout-success`,
        cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout`,
      };

      console.log('🚀 Creating DoorDash checkout session:', {
        orderId: finalRequest.orderId,
        total: finalRequest.total,
        isSandbox,
        endpoint: '/checkout/v1/sessions'
      });

      const response = await this.client.post('/checkout/v1/sessions', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('✅ DoorDash checkout session created:', response.data);

      return {
        checkoutUrl: response.data.checkout_url,
        orderId: response.data.external_order_id,
        status: response.data.status || 'pending',
        paymentIntentId: response.data.payment_intent_id,
        expiresAt: response.data.expires_at,
      };

    } catch (error: any) {
      console.error('❌ DoorDash checkout session creation failed:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(`DoorDash checkout failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get order status from DoorDash
   */
  async getOrderStatus(orderId: string): Promise<DoorDashOrderStatus> {
    try {
      const token = this.generateJWTToken();
      
      const response = await this.client.get(`/orders/v1/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const order = response.data;
      
      return {
        orderId: order.external_order_id,
        status: order.status,
        paymentStatus: order.payment_status,
        deliveryStatus: order.delivery_status,
        estimatedPickupTime: order.estimated_pickup_time,
        estimatedDeliveryTime: order.estimated_delivery_time,
        actualPickupTime: order.actual_pickup_time,
        actualDeliveryTime: order.actual_delivery_time,
        driverInfo: order.driver ? {
          name: order.driver.name,
          phone: order.driver.phone,
          vehicleInfo: order.driver.vehicle_info,
        } : undefined,
        trackingUrl: order.tracking_url,
      };

    } catch (error: any) {
      console.error('❌ Failed to get DoorDash order status:', {
        orderId,
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Failed to get order status: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Cancel an order in DoorDash
   */
  async cancelOrder(orderId: string, reason?: string): Promise<boolean> {
    try {
      const token = this.generateJWTToken();
      
      const response = await this.client.post(`/orders/v1/orders/${orderId}/cancel`, {
        reason: reason || 'Customer requested cancellation',
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('✅ DoorDash order cancelled:', orderId);
      return response.data.success || true;

    } catch (error: any) {
      console.error('❌ Failed to cancel DoorDash order:', {
        orderId,
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Failed to cancel order: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const expectedSignature = jwt.sign(
        payload,
        this.config.webhookSecret,
        { algorithm: 'HS256' }
      );
      return signature === expectedSignature;
    } catch (error) {
      console.error('❌ Webhook signature verification failed:', error);
      return false;
    }
  }
}
