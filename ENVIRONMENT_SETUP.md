# Environment Setup Guide

## Quick Start

### 1. Copy Environment File
```bash
cp .env.example .env
```

### 2. Required Environment Variables for DoorDash

Add these to your `.env` file:

```bash
# DoorDash API Credentials (Get from DoorDash Developer Portal)
DOORDASH_API_KEY="your-doordash-api-key"
DOORDASH_API_SECRET="your-doordash-api-secret"
DOORDASH_MERCHANT_ID="your-doordash-merchant-id"

# DoorDash API URL (Choose one)
# For Testing/Sandbox:
DOORDASH_BASE_URL="https://openapi-sandbox.doordash.com"
# For Production:
# DOORDASH_BASE_URL="https://openapi.doordash.com"

# DoorDash Webhook Security
DOORDASH_WEBHOOK_SECRET="your-doordash-webhook-secret"
```

### 3. Get DoorDash Credentials

1. **Sign up** at [DoorDash Developer Portal](https://developer.doordash.com/)
2. **Complete business verification**
3. **Apply for API access**
4. **Get your credentials** from the developer dashboard

### 4. Test Configuration

After adding your credentials:

```bash
npm run dev
```

Look for this message in the console:
```
✅ DoorDash configured successfully
```

If you see:
```
⚠️ DoorDash not configured, delivery functionality disabled
```

Then check your `.env` file and make sure all DoorDash variables are set correctly.

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DOORDASH_API_KEY` | Your DoorDash API key | Yes | `dd_api_1234567890` |
| `DOORDASH_API_SECRET` | Your DoorDash API secret | Yes | `dd_secret_abcdef123456` |
| `DOORDASH_MERCHANT_ID` | Your DoorDash merchant ID | Yes | `merchant_12345` |
| `DOORDASH_BASE_URL` | DoorDash API base URL | Yes | `https://openapi-sandbox.doordash.com` |
| `DOORDASH_WEBHOOK_SECRET` | Webhook security secret | Yes | `webhook_secret_xyz789` |

## Troubleshooting

### Common Issues:

1. **"DoorDash not configured"** - Check that all 5 DoorDash variables are set in `.env`
2. **"Invalid API credentials"** - Verify your credentials with DoorDash
3. **"Sandbox not available"** - Make sure you're using the sandbox URL for testing

### Testing Delivery:

1. **Place a test order** in your app
2. **Go to Admin Dashboard** → Orders
3. **Change order status** to "Confirmed"
4. **Check console** for DoorDash delivery creation logs
5. **Check Delivery Management tab** for delivery status
