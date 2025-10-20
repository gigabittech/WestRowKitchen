import { Express, Request, Response } from 'express';
import { DoorDashService } from './service.js';
import { DoorDashConfig } from './types.js';

export function setupDoorDashRoutes(app: Express, doorDashService: DoorDashService) {
  
  /**
   * Create DoorDash delivery request for an order
   * POST /api/delivery/doordash/create
   */
  app.post('/api/delivery/doordash/create', async (req: Request, res: Response) => {
    try {
      const { orderId, restaurantId, customerId, pickupAddress, deliveryAddress, items, totalAmount, specialInstructions } = req.body;

      // Validate required fields
      if (!orderId || !restaurantId || !customerId || !pickupAddress || !deliveryAddress || !items || !totalAmount) {
        return res.status(400).json({ 
          message: 'Missing required fields',
          required: ['orderId', 'restaurantId', 'customerId', 'pickupAddress', 'deliveryAddress', 'items', 'totalAmount']
        });
      }

      // Estimate delivery times
      const timeEstimate = await doorDashService.estimateDeliveryTime(pickupAddress, deliveryAddress);

      const deliveryRequest = {
        orderId,
        restaurantId,
        customerId,
        pickupAddress,
        deliveryAddress,
        items,
        totalAmount,
        estimatedPickupTime: timeEstimate.estimatedPickupTime,
        estimatedDeliveryTime: timeEstimate.estimatedDeliveryTime,
        specialInstructions,
      };

      const deliveryResponse = await doorDashService.createDelivery(deliveryRequest);

      res.json({
        success: true,
        delivery: deliveryResponse,
        message: 'DoorDash delivery request created successfully'
      });

    } catch (error: any) {
      console.error('DoorDash delivery creation error:', error);
      res.status(500).json({ 
        message: 'Failed to create DoorDash delivery request',
        error: error.message 
      });
    }
  });

  /**
   * Get DoorDash delivery status
   * GET /api/delivery/doordash/:deliveryId/status
   */
  app.get('/api/delivery/doordash/:deliveryId/status', async (req: Request, res: Response) => {
    try {
      const { deliveryId } = req.params;
      
      if (!deliveryId) {
        return res.status(400).json({ message: 'Delivery ID is required' });
      }

      const deliveryStatus = await doorDashService.getDeliveryStatus(deliveryId);

      res.json({
        success: true,
        status: deliveryStatus
      });

    } catch (error: any) {
      console.error('DoorDash delivery status error:', error);
      res.status(500).json({ 
        message: 'Failed to get DoorDash delivery status',
        error: error.message 
      });
    }
  });

  /**
   * Cancel DoorDash delivery
   * POST /api/delivery/doordash/:deliveryId/cancel
   */
  app.post('/api/delivery/doordash/:deliveryId/cancel', async (req: Request, res: Response) => {
    try {
      const { deliveryId } = req.params;
      const { reason } = req.body;

      if (!deliveryId) {
        return res.status(400).json({ message: 'Delivery ID is required' });
      }

      const cancelled = await doorDashService.cancelDelivery(deliveryId, reason);

      res.json({
        success: cancelled,
        message: cancelled ? 'DoorDash delivery cancelled successfully' : 'Failed to cancel DoorDash delivery'
      });

    } catch (error: any) {
      console.error('DoorDash delivery cancellation error:', error);
      res.status(500).json({ 
        message: 'Failed to cancel DoorDash delivery',
        error: error.message 
      });
    }
  });

  /**
   * Check DoorDash delivery availability
   * GET /api/delivery/doordash/availability/:zipCode
   */
  app.get('/api/delivery/doordash/availability/:zipCode', async (req: Request, res: Response) => {
    try {
      const { zipCode } = req.params;

      if (!zipCode) {
        return res.status(400).json({ message: 'Zip code is required' });
      }

      const isAvailable = await doorDashService.checkAvailability(zipCode);

      res.json({
        success: true,
        available: isAvailable,
        zipCode,
        provider: 'doordash'
      });

    } catch (error: any) {
      console.error('DoorDash availability check error:', error);
      res.status(500).json({ 
        message: 'Failed to check DoorDash availability',
        error: error.message 
      });
    }
  });

  /**
   * DoorDash webhook endpoint
   * POST /api/delivery/doordash/webhook
   */
  app.post('/api/delivery/doordash/webhook', async (req: Request, res: Response) => {
    try {
      const signature = req.headers['x-doordash-signature'] as string;
      const payload = req.body;

      if (!signature) {
        return res.status(401).json({ message: 'Missing DoorDash signature' });
      }

      const deliveryStatus = await doorDashService.processWebhook(payload, signature);

      if (!deliveryStatus) {
        return res.status(400).json({ message: 'Invalid DoorDash webhook' });
      }

      console.log(`DoorDash delivery status updated: ${deliveryStatus.deliveryId} - ${deliveryStatus.status}`);

      res.json({ success: true, message: 'DoorDash webhook processed successfully' });

    } catch (error: any) {
      console.error('DoorDash webhook processing error:', error);
      res.status(500).json({ 
        message: 'Failed to process DoorDash webhook',
        error: error.message 
      });
    }
  });
}
