// DoorDash Configuration Example
// Copy these values to your .env file

export const DOORDASH_CONFIG_EXAMPLE = {
  // DoorDash API Credentials (from DoorDash Developer Portal)
  DOORDASH_API_KEY: 'your-doordash-api-key',
  DOORDASH_API_SECRET: 'your-doordash-api-secret',
  DOORDASH_MERCHANT_ID: 'your-doordash-merchant-id',
  
  // API Endpoints
  DOORDASH_BASE_URL: 'https://openapi.doordash.com', // Production
  // DOORDASH_BASE_URL: 'https://openapi-sandbox.doordash.com', // Sandbox
  
  // Webhook Security
  DOORDASH_WEBHOOK_SECRET: 'your-doordash-webhook-secret',
};

// Environment Variables to Set:
/*
DOORDASH_API_KEY=your-doordash-api-key
DOORDASH_API_SECRET=your-doordash-api-secret
DOORDASH_MERCHANT_ID=your-doordash-merchant-id
DOORDASH_BASE_URL=https://openapi.doordash.com
DOORDASH_WEBHOOK_SECRET=your-doordash-webhook-secret
*/

// Sandbox vs Production URLs:
export const DOORDASH_URLS = {
  SANDBOX: 'https://openapi-sandbox.doordash.com',
  PRODUCTION: 'https://openapi.doordash.com'
};
