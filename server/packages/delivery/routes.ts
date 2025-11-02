import { Express, Request, Response } from 'express';
import { DeliveryService } from './service.js';
// DoorDash checkout routes removed - DoorDash doesn't provide payment APIs for external use
// Payment is handled by Stripe, DoorDash Drive API is used only for delivery
// import { setupDoorDashCheckoutRoutes } from './doordash/checkout-routes.js';

export function setupDeliveryRoutes(app: Express, deliveryService: DeliveryService) {
  // DoorDash checkout routes removed - not applicable for external payment processing
  // setupDoorDashCheckoutRoutes(app);
  
  /**
   * Create delivery request for an order
   * POST /api/delivery/create
   */
  app.post('/api/delivery/create', async (req: Request, res: Response) => {
    try {
      const { orderId, restaurantId, customerId, pickupAddress, deliveryAddress, items, totalAmount, specialInstructions, provider } = req.body;

      // Validate required fields
      if (!orderId || !restaurantId || !customerId || !pickupAddress || !deliveryAddress || !items || !totalAmount) {
        return res.status(400).json({ 
          message: 'Missing required fields',
          required: ['orderId', 'restaurantId', 'customerId', 'pickupAddress', 'deliveryAddress', 'items', 'totalAmount']
        });
      }

      const deliveryRequest = {
        orderId,
        restaurantId,
        customerId,
        pickupAddress,
        deliveryAddress,
        items,
        totalAmount,
        estimatedPickupTime: '', // Will be set by the service
        estimatedDeliveryTime: '', // Will be set by the service
        specialInstructions,
      };

      const deliveryResponse = await deliveryService.createDelivery(deliveryRequest, provider);

      res.json({
        success: true,
        delivery: deliveryResponse,
        message: `${deliveryResponse.provider} delivery request created successfully`
      });

    } catch (error: any) {
      console.error('Delivery creation error:', error);
      res.status(500).json({ 
        message: 'Failed to create delivery request',
        error: error.message 
      });
    }
  });

  /**
   * Get delivery status
   * GET /api/delivery/:deliveryId/status
   */
  app.get('/api/delivery/:deliveryId/status', async (req: Request, res: Response) => {
    try {
      const { deliveryId } = req.params;
      const { provider } = req.query;
      
      if (!deliveryId) {
        return res.status(400).json({ message: 'Delivery ID is required' });
      }

      if (!provider) {
        return res.status(400).json({ message: 'Provider is required' });
      }

      const deliveryStatus = await deliveryService.getDeliveryStatus(deliveryId, provider as string);

      res.json({
        success: true,
        status: deliveryStatus
      });

    } catch (error: any) {
      console.error('Delivery status error:', error);
      res.status(500).json({ 
        message: 'Failed to get delivery status',
        error: error.message 
      });
    }
  });

  /**
   * Cancel delivery
   * POST /api/delivery/:deliveryId/cancel
   */
  app.post('/api/delivery/:deliveryId/cancel', async (req: Request, res: Response) => {
    try {
      const { deliveryId } = req.params;
      const { reason, provider } = req.body;

      if (!deliveryId) {
        return res.status(400).json({ message: 'Delivery ID is required' });
      }

      if (!provider) {
        return res.status(400).json({ message: 'Provider is required' });
      }

      const cancelled = await deliveryService.cancelDelivery(deliveryId, provider, reason);

      res.json({
        success: cancelled,
        message: cancelled ? `${provider} delivery cancelled successfully` : `Failed to cancel ${provider} delivery`
      });

    } catch (error: any) {
      console.error('Delivery cancellation error:', error);
      res.status(500).json({ 
        message: 'Failed to cancel delivery',
        error: error.message 
      });
    }
  });

  /**
   * Check delivery availability
   * GET /api/delivery/availability/:zipCode
   */
  app.get('/api/delivery/availability/:zipCode', async (req: Request, res: Response) => {
    try {
      const { zipCode } = req.params;
      const { provider } = req.query;

      if (!zipCode) {
        return res.status(400).json({ message: 'Zip code is required' });
      }

      const isAvailable = await deliveryService.checkAvailability(zipCode, provider as string);
      const availableProviders = deliveryService.getAvailableProviders();

      res.json({
        success: true,
        available: isAvailable,
        zipCode,
        provider: provider || 'any',
        availableProviders
      });

    } catch (error: any) {
      console.error('Availability check error:', error);
      res.status(500).json({ 
        message: 'Failed to check availability',
        error: error.message 
      });
    }
  });

  /**
   * Get available delivery providers
   * GET /api/delivery/providers
   */
  app.get('/api/delivery/providers', async (req: Request, res: Response) => {
    try {
      const providers = deliveryService.getAvailableProviders();

      res.json({
        success: true,
        providers,
        count: providers.length
      });

    } catch (error: any) {
      console.error('Get providers error:', error);
      res.status(500).json({ 
        message: 'Failed to get delivery providers',
        error: error.message 
      });
    }
  });

  /**
   * Get all deliveries for admin dashboard
   * GET /api/delivery/status
   */
  app.get('/api/delivery/status', async (req: Request, res: Response) => {
    try {
      const { storage } = await import('../../storage.js');
      
      // Try to get deliveries from database
      let deliveries = [];
      try {
        deliveries = await storage.getAllDeliveries();
      } catch (dbError: any) {
        // If tables don't exist yet, return empty array
        if (dbError.message?.includes('relation "deliveries" does not exist')) {
          console.log('📦 Delivery tables not created yet, returning empty array');
          return res.json([]);
        }
        throw dbError;
      }
      
      // Transform the data for the frontend (match admin UI expectations)
      const transformedDeliveries = deliveries.map(delivery => ({
        id: delivery.id,
        orderId: delivery.orderId,
        externalDeliveryId: delivery.externalDeliveryId,
        doordashDeliveryId: delivery.doordashDeliveryId,
        provider: 'doordash',
        status: delivery.status,
        pickupAddress: delivery.pickupAddress,
        dropoffAddress: delivery.dropoffAddress,
        pickupBusinessName: delivery.pickupBusinessName,
        dropoffBusinessName: delivery.dropoffBusinessName,
        pickupPhoneNumber: delivery.pickupPhoneNumber,
        dropoffPhoneNumber: delivery.dropoffPhoneNumber,
        pickupInstructions: delivery.pickupInstructions,
        dropoffInstructions: delivery.dropoffInstructions,
        orderValue: delivery.orderValue,
        driverInfo: delivery.driverName ? {
          name: delivery.driverName,
          phone: delivery.driverPhone,
          vehicleInfo: delivery.driverVehicleInfo,
        } : null,
        trackingUrl: delivery.trackingUrl,
        // Keep both legacy and new names to avoid UI mismatches
        pickupTime: delivery.pickupTime?.toISOString(),
        dropoffTime: delivery.dropoffTime?.toISOString(),
        estimatedPickupTime: delivery.pickupTime?.toISOString(),
        estimatedDeliveryTime: delivery.dropoffTime?.toISOString(),
        actualPickupTime: delivery.actualPickupTime?.toISOString(),
        actualDeliveryTime: delivery.actualDeliveryTime?.toISOString(),
        updatedAt: delivery.updatedAt?.toISOString(),
        createdAt: delivery.createdAt?.toISOString(),
        updatedAtSystem: delivery.updatedAtSystem?.toISOString(),
      }));

      res.json(transformedDeliveries);
    } catch (error: any) {
      console.error('Get deliveries error:', error);
      res.status(500).json({ 
        message: 'Failed to get deliveries',
        error: error.message 
      });
    }
  });

  /**
   * Generic webhook endpoint for all providers
   * POST /api/delivery/webhook/:provider
   */
  app.post('/api/delivery/webhook/:provider', async (req: Request, res: Response) => {
    try {
      const { provider } = req.params;
      const signature = req.headers['x-signature'] as string;
      const payload = req.body;

      if (!signature) {
        return res.status(401).json({ message: `Missing ${provider} signature` });
      }

      const deliveryStatus = await deliveryService.processWebhook(payload, signature, provider);

      if (!deliveryStatus) {
        return res.status(400).json({ message: `Invalid ${provider} webhook` });
      }

      console.log(`${provider} delivery status updated: ${deliveryStatus.deliveryId} - ${deliveryStatus.status}`);

      res.json({ success: true, message: `${provider} webhook processed successfully` });

    } catch (error: any) {
      console.error(`${req.params.provider} webhook processing error:`, error);
      res.status(500).json({ 
        message: `Failed to process ${req.params.provider} webhook`,
        error: error.message 
      });
    }
  });
}
