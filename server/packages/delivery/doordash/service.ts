import { DoorDashAPI } from './api.js';
import { 
  DoorDashDeliveryRequest, 
  DoorDashDeliveryResponse, 
  DoorDashDeliveryStatus, 
  DoorDashConfig 
} from './types.js';

export class DoorDashService {
  private doorDashAPI: DoorDashAPI;
  private config: DoorDashConfig;

  constructor(config: DoorDashConfig) {
    this.config = config;
    this.doorDashAPI = new DoorDashAPI(config);
  }

  /**
   * Create a delivery request
   */
  async createDelivery(deliveryRequest: DoorDashDeliveryRequest): Promise<DoorDashDeliveryResponse> {
    try {
      console.log(`Creating DoorDash delivery for order: ${deliveryRequest.orderId}`);
      
      const deliveryResponse = await this.doorDashAPI.createDelivery(deliveryRequest);
      
      console.log(`DoorDash delivery created: ${deliveryResponse.deliveryId}`);
      return deliveryResponse;
    } catch (error: any) {
      console.error('DoorDash delivery creation failed:', error.message);
      throw new Error(`Failed to create DoorDash delivery: ${error.message}`);
    }
  }

  /**
   * Get delivery status
   */
  async getDeliveryStatus(deliveryId: string): Promise<DoorDashDeliveryStatus> {
    try {
      return await this.doorDashAPI.getDeliveryStatus(deliveryId);
    } catch (error: any) {
      console.error('Failed to get DoorDash delivery status:', error.message);
      throw new Error(`Failed to get DoorDash delivery status: ${error.message}`);
    }
  }

  /**
   * Cancel delivery
   */
  async cancelDelivery(deliveryId: string, reason?: string): Promise<boolean> {
    try {
      return await this.doorDashAPI.cancelDelivery(deliveryId, reason);
    } catch (error: any) {
      console.error('Failed to cancel DoorDash delivery:', error.message);
      throw new Error(`Failed to cancel DoorDash delivery: ${error.message}`);
    }
  }

  /**
   * Process webhook from DoorDash
   */
  async processWebhook(payload: any, signature: string): Promise<DoorDashDeliveryStatus | null> {
    try {
      // Verify webhook signature
      const payloadString = JSON.stringify(payload);
      if (!this.doorDashAPI.verifyWebhookSignature(payloadString, signature)) {
        console.error('Invalid DoorDash webhook signature');
        return null;
      }

      // Process the webhook
      const deliveryStatus = this.doorDashAPI.processWebhook(payload);
      
      console.log(`DoorDash webhook processed for delivery ${deliveryStatus.deliveryId}: ${deliveryStatus.status}`);
      return deliveryStatus;
    } catch (error: any) {
      console.error('DoorDash webhook processing failed:', error.message);
      return null;
    }
  }

  /**
   * Check if DoorDash delivery is available in the area
   */
  async checkAvailability(zipCode: string): Promise<boolean> {
    try {
      // This would typically call DoorDash's availability API
      // For now, we'll assume availability based on common delivery areas
      const supportedZipCodes = [
        '10001', '10002', '10003', // NYC
        '90210', '90211', '90212', // LA
        '60601', '60602', '60603', // Chicago
        // Add more zip codes as needed
      ];
      
      return supportedZipCodes.includes(zipCode);
    } catch (error: any) {
      console.error('DoorDash availability check failed:', error.message);
      return false;
    }
  }

  /**
   * Estimate delivery time
   */
  async estimateDeliveryTime(pickupAddress: any, deliveryAddress: any): Promise<{
    estimatedPickupTime: string;
    estimatedDeliveryTime: string;
  }> {
    try {
      // This would typically call DoorDash's estimation API
      // For now, we'll provide a basic estimation
      const now = new Date();
      const pickupTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
      const deliveryTime = new Date(pickupTime.getTime() + 30 * 60 * 1000); // 30 minutes after pickup
      
      return {
        estimatedPickupTime: pickupTime.toISOString(),
        estimatedDeliveryTime: deliveryTime.toISOString(),
      };
    } catch (error: any) {
      console.error('DoorDash delivery time estimation failed:', error.message);
      throw new Error(`Failed to estimate DoorDash delivery time: ${error.message}`);
    }
  }
}
