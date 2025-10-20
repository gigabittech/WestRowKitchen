export interface DoorDashDeliveryRequest {
  orderId: string;
  restaurantId: string;
  customerId: string;
  // If provided, these flat address lines will be used directly (preferred)
  pickupAddressLine?: string;
  dropoffAddressLine?: string;
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    instructions?: string;
  };
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    instructions?: string;
  };
  // Contact/business info
  pickupPhone?: string;
  dropoffPhone?: string;
  pickupBusinessName?: string;
  dropoffBusinessName?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  estimatedPickupTime: string; // ISO 8601 format
  estimatedDeliveryTime: string; // ISO 8601 format
  specialInstructions?: string;
}

export interface DoorDashDeliveryResponse {
  deliveryId: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  estimatedPickupTime: string;
  estimatedDeliveryTime: string;
  driverInfo?: {
    name: string;
    phone: string;
    vehicleInfo: string;
  };
  trackingUrl?: string;
}

export interface DoorDashDeliveryStatus {
  deliveryId: string;
  orderId: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  timestamp: string;
  driverInfo?: {
    name: string;
    phone: string;
    vehicleInfo: string;
  };
  trackingUrl?: string;
  estimatedDeliveryTime?: string;
}

export interface DoorDashConfig {
  apiKey: string;
  apiSecret: string;
  merchantId: string;
  baseUrl: string; // Sandbox or Production URL
  webhookSecret: string;
}
