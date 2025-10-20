# DoorDash Integration Guide for West Row Kitchen

## Overview
This guide walks you through integrating DoorDash delivery services into your West Row Kitchen platform. The integration follows a package-based architecture and includes the complete order flow from customer order to DoorDash delivery.

## Architecture

### Package Structure
```
server/packages/delivery/
├── package.json              # Package dependencies
├── types.ts                  # TypeScript interfaces
├── doordash-api.ts          # DoorDash API client
├── delivery-service.ts      # Main delivery service
├── routes.ts                # API routes
├── schema.sql               # Database schema
├── config.example.ts        # Configuration example
└── index.ts                 # Package exports
```

### Order Flow
1. **Customer places order** → Status: `pending`
2. **Admin confirms order** → Status: `confirmed` → **DoorDash delivery triggered**
3. **DoorDash processes delivery** → Status updates via webhooks
4. **Customer receives delivery** → Status: `delivered`

## Step 1: Environment Configuration

### 1.1 Set Up Environment Variables
1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit your `.env` file** and add your DoorDash credentials:
   ```bash
   # DoorDash Integration
   DOORDASH_API_KEY="your-doordash-api-key"
   DOORDASH_API_SECRET="your-doordash-api-secret"
   DOORDASH_MERCHANT_ID="your-doordash-merchant-id"
   DOORDASH_BASE_URL="https://openapi-sandbox.doordash.com"
   DOORDASH_WEBHOOK_SECRET="your-doordash-webhook-secret"
   ```

3. **For development, use the sandbox URL:**
   ```bash
   DOORDASH_BASE_URL="https://openapi-sandbox.doordash.com"
   ```

4. **For production, use the production URL:**
   ```bash
   DOORDASH_BASE_URL="https://openapi.doordash.com"
   ```

## Step 2: DoorDash Developer Account Setup

### 2.1 Create DoorDash Developer Account
1. Go to [DoorDash Developer Portal](https://developer.doordash.com/)
2. Sign up for a developer account
3. Complete business verification process
4. Apply for API access (requires business documentation)

### 1.2 Get API Credentials
1. **API Key**: Your DoorDash API key
2. **API Secret**: Your DoorDash API secret
3. **Merchant ID**: Your DoorDash merchant ID
4. **Webhook Secret**: Secret for webhook verification

### 1.3 Sandbox vs Production
- **Sandbox**: Use for testing (`https://openapi-sandbox.doordash.com`)
- **Production**: Use for live orders (`https://openapi.doordash.com`)

## Step 2: Environment Configuration

### 2.1 Add Environment Variables
Add these to your `.env` file:

```bash
# DoorDash Integration
DOORDASH_API_KEY=your-doordash-api-key
DOORDASH_API_SECRET=your-doordash-api-secret
DOORDASH_MERCHANT_ID=your-doordash-merchant-id
DOORDASH_BASE_URL=https://openapi.doordash.com
DOORDASH_WEBHOOK_SECRET=your-doordash-webhook-secret
```

### 2.2 Webhook Configuration
1. Set webhook URL in DoorDash dashboard: `https://yourdomain.com/api/delivery/webhook/doordash`
2. Configure webhook events: `delivery.status.updated`
3. Use the webhook secret for signature verification

## Step 3: Database Setup

### 3.1 Run Database Migration
Execute the SQL schema in `server/packages/delivery/schema.sql`:

```sql
-- Create delivery tracking tables
-- (See schema.sql for complete SQL)
```

### 3.2 Database Tables Created
- `delivery_requests`: Track DoorDash delivery requests
- `delivery_status_history`: Track delivery status changes

## Step 4: API Endpoints

### 4.1 Available Endpoints

#### Create Delivery Request
```http
POST /api/delivery/create
Content-Type: application/json

{
  "orderId": "order-uuid",
  "restaurantId": "restaurant-uuid", 
  "customerId": "customer-uuid",
  "pickupAddress": {
    "street": "123 Restaurant St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US",
    "instructions": "Restaurant pickup"
  },
  "deliveryAddress": {
    "street": "456 Customer Ave",
    "city": "New York", 
    "state": "NY",
    "zipCode": "10002",
    "country": "US",
    "instructions": "Ring doorbell"
  },
  "items": [
    {
      "name": "Burger",
      "quantity": 2,
      "price": 12.99
    }
  ],
  "totalAmount": 25.98,
  "specialInstructions": "Extra napkins"
}
```

#### Get Delivery Status
```http
GET /api/delivery/{deliveryId}/status
```

#### Cancel Delivery
```http
POST /api/delivery/{deliveryId}/cancel
Content-Type: application/json

{
  "reason": "Customer requested cancellation"
}
```

#### Check Availability
```http
GET /api/delivery/availability/{zipCode}
```

#### DoorDash Webhook
```http
POST /api/delivery/webhook/doordash
X-DoorDash-Signature: webhook-signature
```

## Step 5: Order Flow Integration

### 5.1 Automatic Delivery Trigger
When an admin confirms an order (status: `confirmed`), the system automatically:

1. **Fetches order details** (customer, restaurant, items)
2. **Parses addresses** (pickup from restaurant, delivery to customer)
3. **Creates DoorDash delivery request**
4. **Logs delivery ID** for tracking

### 5.2 Status Updates
DoorDash sends webhook updates for:
- `pending` → Order created, waiting for driver
- `accepted` → Driver assigned
- `picked_up` → Driver picked up order
- `delivered` → Order delivered to customer
- `cancelled` → Delivery cancelled

## Step 6: Admin Interface Integration

### 6.1 Admin Dashboard Updates
Add delivery tracking to your admin interface:

```typescript
// Add to admin order management
interface OrderWithDelivery {
  id: string;
  status: string;
  delivery?: {
    deliveryId: string;
    status: string;
    driverInfo?: {
      name: string;
      phone: string;
      vehicleInfo: string;
    };
    trackingUrl?: string;
  };
}
```

### 6.2 Delivery Management Features
- **View delivery status** for each order
- **Cancel delivery** if needed
- **Track driver location** (if available)
- **Contact driver** directly

## Step 7: Testing

### 7.1 Sandbox Testing
1. Use DoorDash sandbox environment
2. Test with sandbox API credentials
3. Verify webhook delivery
4. Test all delivery statuses

### 7.2 Test Scenarios
1. **Create delivery** → Verify DoorDash receives request
2. **Status updates** → Verify webhook processing
3. **Cancel delivery** → Verify cancellation
4. **Availability check** → Verify zip code validation

## Step 8: Production Deployment

### 8.1 Pre-deployment Checklist
- [ ] DoorDash production API credentials
- [ ] Webhook URL configured in DoorDash dashboard
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] SSL certificate for webhook endpoint

### 8.2 Monitoring
- Monitor delivery success rates
- Track webhook processing
- Log delivery failures
- Monitor API rate limits

## Step 9: Error Handling

### 9.1 Common Issues
- **API Rate Limits**: Implement retry logic
- **Webhook Failures**: Log and retry
- **Address Validation**: Validate before sending to DoorDash
- **Network Issues**: Implement timeout handling

### 9.2 Fallback Options
- Manual delivery coordination
- Alternative delivery providers
- Customer pickup options

## Step 10: Maintenance

### 10.1 Regular Tasks
- Monitor delivery performance
- Update API credentials as needed
- Review webhook logs
- Optimize delivery routes

### 10.2 Support
- DoorDash support for API issues
- Monitor DoorDash status page
- Keep API documentation updated

## API Reference

### DoorDash API Endpoints Used
- `POST /v2/deliveries` - Create delivery
- `GET /v2/deliveries/{id}` - Get delivery status
- `POST /v2/deliveries/{id}/cancel` - Cancel delivery

### Webhook Events
- `delivery.status.updated` - Status change notifications

## Security Considerations

### Authentication
- HMAC signature verification for webhooks
- API key authentication for requests
- Secure credential storage

### Data Protection
- Encrypt sensitive delivery data
- Secure webhook endpoints
- Rate limiting on API endpoints

## Cost Considerations

### DoorDash Fees
- Delivery fees vary by location
- Commission fees on orders
- API usage fees (if applicable)

### Optimization
- Batch delivery requests
- Optimize delivery routes
- Monitor delivery costs

---

## Quick Start Checklist

- [ ] DoorDash developer account created
- [ ] API credentials obtained
- [ ] Environment variables configured
- [ ] Database schema applied
- [ ] Webhook URL configured
- [ ] Test delivery created
- [ ] Webhook processing verified
- [ ] Admin interface updated
- [ ] Production deployment ready

## Support

For technical support:
- Check DoorDash API documentation
- Review webhook logs
- Monitor delivery status
- Contact DoorDash support for API issues

---

**Note**: This integration requires active DoorDash partnership and API access. Ensure you have proper business verification and API access before implementing in production.
