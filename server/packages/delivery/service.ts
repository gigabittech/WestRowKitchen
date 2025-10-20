import { DoorDashService } from './doordash/service.js';
import { DoorDashConfig } from './doordash/types.js';
import { DeliveryRequest, DeliveryResponse, DeliveryStatus } from './types.js';

export class DeliveryService {
  private doorDashService?: DoorDashService;
  private providers: Map<string, any> = new Map();

  constructor() {
    // Initialize DoorDash if configured
    this.initializeDoorDash();
  }

  private initializeDoorDash() {
    try {
      const doorDashConfig: DoorDashConfig = {
        apiKey: process.env.DOORDASH_API_KEY || '',
        apiSecret: process.env.DOORDASH_API_SECRET || '',
        merchantId: process.env.DOORDASH_MERCHANT_ID || '',
        baseUrl: process.env.DOORDASH_BASE_URL || 'https://openapi.doordash.com',
        webhookSecret: process.env.DOORDASH_WEBHOOK_SECRET || '',
      };

      if (doorDashConfig.apiKey && doorDashConfig.apiSecret) {
        this.doorDashService = new DoorDashService(doorDashConfig);
        this.providers.set('doordash', this.doorDashService);
        console.log("DoorDash delivery service initialized");
      } else {
        console.log("DoorDash not configured, delivery functionality disabled");
      }
    } catch (error) {
      console.log("DoorDash delivery service initialization failed:", error);
    }
  }

  /**
   * Create delivery with the best available provider
   */
  async createDelivery(deliveryRequest: DeliveryRequest, preferredProvider?: string): Promise<DeliveryResponse> {
    // For now, use DoorDash as the primary provider
    if (this.doorDashService) {
      const doorDashResponse = await this.doorDashService.createDelivery(deliveryRequest);
      
      // Store delivery record in database for admin tracking
      await this.storeDeliveryRecord({
        orderId: deliveryRequest.orderId,
        deliveryId: doorDashResponse.deliveryId,
        provider: 'doordash',
        status: doorDashResponse.status,
        pickupAddress: deliveryRequest.pickupAddress,
        deliveryAddress: deliveryRequest.deliveryAddress,
        driverInfo: doorDashResponse.driverInfo,
        trackingUrl: doorDashResponse.trackingUrl,
        estimatedPickupTime: doorDashResponse.estimatedPickupTime,
        estimatedDeliveryTime: doorDashResponse.estimatedDeliveryTime,
      });
      
      return {
        deliveryId: doorDashResponse.deliveryId,
        provider: 'doordash',
        status: doorDashResponse.status,
        estimatedPickupTime: doorDashResponse.estimatedPickupTime,
        estimatedDeliveryTime: doorDashResponse.estimatedDeliveryTime,
        driverInfo: doorDashResponse.driverInfo,
        trackingUrl: doorDashResponse.trackingUrl,
      };
    }

    throw new Error('No delivery providers available');
  }

  /**
   * Store delivery record in database
   */
  private async storeDeliveryRecord(deliveryData: any): Promise<void> {
    try {
      const { storage } = await import('../../storage.js');
      
      const deliveryRecord = {
        orderId: deliveryData.orderId,
        externalDeliveryId: deliveryData.orderId, // Our order ID sent to DoorDash
        doordashDeliveryId: deliveryData.deliveryId || deliveryData.orderId, // Use order ID as DoorDash doesn't return separate ID
        status: deliveryData.status,
        pickupAddress: deliveryData.pickupAddress,
        dropoffAddress: deliveryData.deliveryAddress,
        pickupBusinessName: deliveryData.pickupBusinessName,
        dropoffBusinessName: deliveryData.dropoffBusinessName,
        pickupPhoneNumber: deliveryData.pickupPhone,
        dropoffPhoneNumber: deliveryData.dropoffPhone,
        pickupInstructions: deliveryData.pickupAddress?.instructions,
        dropoffInstructions: deliveryData.deliveryAddress?.instructions,
        orderValue: Math.round((deliveryData.totalAmount || 0) * 100), // Convert to cents
        driverName: deliveryData.driverInfo?.name,
        driverPhone: deliveryData.driverInfo?.phone,
        driverVehicleInfo: deliveryData.driverInfo?.vehicleInfo,
        trackingUrl: deliveryData.trackingUrl,
        pickupTime: deliveryData.estimatedPickupTime ? new Date(deliveryData.estimatedPickupTime) : null,
        dropoffTime: deliveryData.estimatedDeliveryTime ? new Date(deliveryData.estimatedDeliveryTime) : null,
        updatedAt: new Date(), // Last update from DoorDash
      };

      try {
        await storage.createDelivery(deliveryRecord);
        console.log('📦 Delivery record stored in database:', deliveryData.deliveryId);
      } catch (dbError: any) {
        if (dbError.message?.includes('relation "deliveries" does not exist')) {
          console.log('📦 Delivery tables not created yet, skipping database storage');
          return;
        }
        throw dbError;
      }
    } catch (error) {
      console.error('Failed to store delivery record:', error);
    }
  }

  /**
   * Get delivery status
   */
  async getDeliveryStatus(deliveryId: string, provider: string): Promise<DeliveryStatus> {
    if (provider === 'doordash' && this.doorDashService) {
      const status = await this.doorDashService.getDeliveryStatus(deliveryId);
      return {
        deliveryId: status.deliveryId,
        orderId: status.orderId,
        provider: 'doordash',
        status: status.status,
        timestamp: status.timestamp,
        driverInfo: status.driverInfo,
        trackingUrl: status.trackingUrl,
        estimatedDeliveryTime: status.estimatedDeliveryTime,
      };
    }

    throw new Error(`Provider ${provider} not available`);
  }

  /**
   * Cancel delivery
   */
  async cancelDelivery(deliveryId: string, provider: string, reason?: string): Promise<boolean> {
    if (provider === 'doordash' && this.doorDashService) {
      return await this.doorDashService.cancelDelivery(deliveryId, reason);
    }

    throw new Error(`Provider ${provider} not available`);
  }

  /**
   * Check availability
   */
  async checkAvailability(zipCode: string, provider?: string): Promise<boolean> {
    if (!provider || provider === 'doordash') {
      if (this.doorDashService) {
        return await this.doorDashService.checkAvailability(zipCode);
      }
    }

    return false;
  }

  /**
   * Process webhook
   */
  async processWebhook(payload: any, signature: string, provider: string): Promise<DeliveryStatus | null> {
    if (provider === 'doordash' && this.doorDashService) {
      return await this.doorDashService.processWebhook(payload, signature);
    }

    return null;
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if provider is available
   */
  isProviderAvailable(provider: string): boolean {
    return this.providers.has(provider);
  }
}
