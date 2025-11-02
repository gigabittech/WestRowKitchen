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
    price: number;
    category?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  total: number;
  estimatedPickupTime: string;
  estimatedDeliveryTime: string;
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
