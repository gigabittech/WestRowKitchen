import axios, { AxiosInstance } from "axios";
import jwt from "jsonwebtoken";
import {
  DoorDashDeliveryRequest,
  DoorDashDeliveryResponse,
  DoorDashDeliveryStatus,
  DoorDashConfig,
} from "./types.js";

export class DoorDashAPI {
  private client: AxiosInstance;
  private config: DoorDashConfig;

  constructor(config: DoorDashConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for DoorDash JWT authentication
    this.client.interceptors.request.use((config) => {
      const token = this.generateJWTToken();

      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };

      return config;
    });
  }

  /**
   * Generate JWT token for DoorDash API authentication
   */
  private generateJWTToken(): string {
    const accessKey = {
      developer_id: this.config.merchantId,
      key_id: this.config.apiKey,
      signing_secret: this.config.apiSecret,
    };

    const data = {
      aud: "doordash",
      iss: accessKey.developer_id,
      kid: accessKey.key_id,
      exp: Math.floor(Date.now() / 1000 + 300), // 5 minutes from now
      iat: Math.floor(Date.now() / 1000),
    };

    const headers = {
      algorithm: "HS256",
      header: { "dd-ver": "DD-JWT-V1" },
    };

    return jwt.sign(
      data,
      Buffer.from(accessKey.signing_secret, "base64"),
      headers
    );
  }

  /**
   * Create a delivery request with DoorDash
   */
  // async createDelivery(deliveryRequest: DoorDashDeliveryRequest): Promise<DoorDashDeliveryResponse> {
  //   try {
  //     // Convert to Drive API flat fields per docs
  //     const pickupAddressStr = deliveryRequest.pickupAddressLine || [
  //       deliveryRequest.pickupAddress.street,
  //       deliveryRequest.pickupAddress.city,
  //       `${deliveryRequest.pickupAddress.state} ${deliveryRequest.pickupAddress.zipCode}`.trim()
  //     ].filter(Boolean).join(', ');

  //     const dropoffAddressStr = deliveryRequest.dropoffAddressLine || [
  //       deliveryRequest.deliveryAddress.street,
  //       deliveryRequest.deliveryAddress.city,
  //       `${deliveryRequest.deliveryAddress.state} ${deliveryRequest.deliveryAddress.zipCode}`.trim()
  //     ].filter(Boolean).join(', ');

  //     const payload = {
  //       external_delivery_id: deliveryRequest.orderId,
  //       pickup_address: pickupAddressStr,
  //       pickup_business_name: deliveryRequest.pickupBusinessName || 'Restaurant',
  //       pickup_phone_number: deliveryRequest.pickupPhone || '+16505555555',
  //       pickup_instructions: deliveryRequest.pickupAddress.instructions || '',
  //       dropoff_address: dropoffAddressStr,
  //       dropoff_business_name: deliveryRequest.dropoffBusinessName || 'Customer',
  //       dropoff_phone_number: deliveryRequest.dropoffPhone || '+16505555555',
  //       dropoff_instructions: deliveryRequest.deliveryAddress.instructions || '',
  //       order_value: Math.round((deliveryRequest.totalAmount || 0) * 100),
  //       pickup_time: deliveryRequest.estimatedPickupTime || undefined,
  //       dropoff_time: deliveryRequest.estimatedDeliveryTime || undefined,
  //     } as any;

  //     const response = await this.client.post('/drive/v2/deliveries', payload);

  //     return {
  //       deliveryId: response.data.id,
  //       status: response.data.status,
  //       estimatedPickupTime: response.data.pickup_time,
  //       estimatedDeliveryTime: response.data.dropoff_time,
  //       driverInfo: response.data.driver ? {
  //         name: response.data.driver.name,
  //         phone: response.data.driver.phone,
  //         vehicleInfo: response.data.driver.vehicle_info,
  //       } : undefined,
  //       trackingUrl: response.data.tracking_url,
  //     };
  //   } catch (error: any) {
  //     console.error('DoorDash delivery creation failed:', error.response?.data || error.message);
  //     throw new Error(`DoorDash API Error: ${error.response?.data?.message || error.message}`);
  //   }
  // }
  

  async createDelivery(deliveryRequest: DoorDashDeliveryRequest): Promise<DoorDashDeliveryResponse> {
    try {
      const env = (process.env.DOORDASH_ENV || '').toLowerCase() || "production";
      // auto-detect sandbox by env or base URL
      const isSandbox = env === "sandbox" || /sandbox/i.test(this.config.baseUrl);

      console.log(`🌍 DoorDash environment: ${isSandbox ? 'sandbox' : 'production'} (baseUrl=${this.config.baseUrl})`);
  
      // ✅ Make a full copy right at the start (never log raw input in sandbox)
      let finalRequest: DoorDashDeliveryRequest = { ...deliveryRequest };
  
      // ✅ Force sandbox override completely — BEFORE anything else happens
      if (isSandbox) {
        console.log("🧪 Using DoorDash sandbox test addresses and phone numbers");
        finalRequest = {
          ...finalRequest,
          pickupAddress: {
            street: "901 Market Street",
            city: "San Francisco",
            state: "CA",
            zipCode: "94103",
            instructions: "Pickup at front desk",
          },
          deliveryAddress: {
            street: "185 Berry Street",
            city: "San Francisco",
            state: "CA",
            zipCode: "94107",
            instructions: "Leave with receptionist",
          },
          pickupBusinessName: "Test Kitchen",
          dropoffBusinessName: "Test Customer",
          pickupPhone: "+14155552671",
          dropoffPhone: "+14155552672",
        };
      }
  
      // 🧱 Build formatted address strings
      const pickupAddressStr = [
        finalRequest.pickupAddress?.street,
        finalRequest.pickupAddress?.city,
        `${finalRequest.pickupAddress?.state || ""} ${finalRequest.pickupAddress?.zipCode || ""}`.trim(),
      ]
        .filter(Boolean)
        .join(", ");
  
      const dropoffAddressStr = [
        finalRequest.deliveryAddress?.street,
        finalRequest.deliveryAddress?.city,
        `${finalRequest.deliveryAddress?.state || ""} ${finalRequest.deliveryAddress?.zipCode || ""}`.trim(),
      ]
        .filter(Boolean)
        .join(", ");
  
      // 📨 DoorDash payload
      const payload = {
        external_delivery_id: finalRequest.orderId,
        pickup_address: pickupAddressStr,
        pickup_business_name: finalRequest.pickupBusinessName || "Restaurant",
        pickup_phone_number: finalRequest.pickupPhone || "+16505555555",
        pickup_instructions: finalRequest.pickupAddress?.instructions || "",
        dropoff_address: dropoffAddressStr,
        dropoff_business_name: finalRequest.dropoffBusinessName || "Customer",
        dropoff_phone_number: finalRequest.dropoffPhone || "+16505555555",
        dropoff_instructions: finalRequest.deliveryAddress?.instructions || "",
        order_value: Math.round((finalRequest.totalAmount || 0) * 100),
        pickup_time: finalRequest.estimatedPickupTime || undefined,
        dropoff_time: finalRequest.estimatedDeliveryTime || undefined,
      };
  
      // Only log detailed payload in sandbox; in production, log high level only
      if (isSandbox) {
        console.log(`🚀 [SANDBOX] Creating DoorDash delivery for order: ${finalRequest.orderId}`);
        console.log("📦 [SANDBOX] DoorDash Payload:", JSON.stringify(payload, null, 2));
      } else {
        console.log(`🚀 Creating DoorDash delivery (production) for order: ${finalRequest.orderId}`);
      }
  
      // 🌐 API call
      const response = await this.client.post("/drive/v2/deliveries", payload);
      console.log(response)
  
      // 🔍 Debug: Log the full response structure
      console.log("🔍 Full DoorDash API Response:", JSON.stringify(response.data, null, 2));
      console.log(`✅ DoorDash delivery created: ${response.data.external_delivery_id}, status: ${response.data.delivery_status}`);
  
      // 🧾 Structured response - based on actual DoorDash API response
      const deliveryId = response.data.external_delivery_id; // Our order ID
      const status = response.data.delivery_status; // "created", "accepted", etc.
      const pickupTime = response.data.pickup_time_estimated;
      const dropoffTime = response.data.dropoff_time_estimated;
      const trackingUrl = response.data.tracking_url;
      
      return {
        deliveryId: deliveryId,
        status: status,
        estimatedPickupTime: pickupTime,
        estimatedDeliveryTime: dropoffTime,
        driverInfo: response.data.driver
          ? {
              name: response.data.driver.name,
              phone: response.data.driver.phone,
              vehicleInfo: response.data.driver.vehicle_info,
            }
          : undefined,
        trackingUrl: trackingUrl,
      };
    } catch (error: any) {
      const errData = error.response?.data;
      console.error("❌ DoorDash delivery creation failed:");
      console.error("Error status:", error.response?.status);
      console.error("Error headers:", error.response?.headers);
      console.error("Error data:", errData);
      console.error("Full error:", error.message);
      throw new Error(`DoorDash API Error: ${errData?.message || error.message}`);
    }
  }
  
  

  /**
   * Get delivery status from DoorDash
   */
  async getDeliveryStatus(deliveryId: string): Promise<DoorDashDeliveryStatus> {
    try {
      const response = await this.client.get(
        `/drive/v2/deliveries/${deliveryId}`
      );

      return {
        deliveryId: response.data.id,
        orderId: response.data.external_delivery_id,
        status: response.data.status,
        timestamp: response.data.updated_at,
        driverInfo: response.data.driver
          ? {
              name: response.data.driver.name,
              phone: response.data.driver.phone,
              vehicleInfo: response.data.driver.vehicle_info,
            }
          : undefined,
        trackingUrl: response.data.tracking_url,
        estimatedDeliveryTime: response.data.dropoff_time,
      };
    } catch (error: any) {
      console.error(
        "DoorDash status check failed:",
        error.response?.data || error.message
      );
      throw new Error(
        `DoorDash API Error: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Cancel a delivery request
   */
  async cancelDelivery(
    deliveryId: string,
    reason: string = "Customer requested cancellation"
  ): Promise<boolean> {
    try {
      await this.client.post(`/drive/v2/deliveries/${deliveryId}/cancel`, {
        reason,
      });
      return true;
    } catch (error: any) {
      console.error(
        "DoorDash cancellation failed:",
        error.response?.data || error.message
      );
      throw new Error(
        `DoorDash API Error: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac("sha256", this.config.webhookSecret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  }

  /**
   * Process webhook payload
   */
  processWebhook(payload: any): DoorDashDeliveryStatus {
    return {
      deliveryId: payload.delivery_id,
      orderId: payload.external_delivery_id,
      status: payload.status,
      timestamp: payload.updated_at,
      driverInfo: payload.driver
        ? {
            name: payload.driver.name,
            phone: payload.driver.phone,
            vehicleInfo: payload.driver.vehicle_info,
          }
        : undefined,
      trackingUrl: payload.tracking_url,
      estimatedDeliveryTime: payload.dropoff_time,
    };
  }
}
