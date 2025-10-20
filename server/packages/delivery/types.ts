// Common delivery types that can be shared across different delivery providers

export interface DeliveryProvider {
  name: 'doordash';
  isEnabled: boolean;
  config: any; // Provider-specific config
}

export interface DeliveryRequest {
  orderId: string;
  restaurantId: string;
  customerId: string;
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
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  estimatedPickupTime: string;
  estimatedDeliveryTime: string;
  specialInstructions?: string;
}

export interface DeliveryResponse {
  deliveryId: string;
  provider: string;
  status: string;
  estimatedPickupTime: string;
  estimatedDeliveryTime: string;
  driverInfo?: {
    name: string;
    phone: string;
    vehicleInfo: string;
  };
  trackingUrl?: string;
}

export interface DeliveryStatus {
  deliveryId: string;
  orderId: string;
  provider: string;
  status: string;
  timestamp: string;
  driverInfo?: {
    name: string;
    phone: string;
    vehicleInfo: string;
  };
  trackingUrl?: string;
  estimatedDeliveryTime?: string;
}