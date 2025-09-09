# West Row Kitchen - Setup Guide

This guide will help you set up the West Row Kitchen application for development and production deployment.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager
- PM2 (for production deployment)

## Environment Variables Setup

### 1. Server Environment Variables (Root Directory)

Create a `.env` file in the root directory with the following variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/westrowkitchen

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=your-secret-key-here-change-in-production

# Email Configuration (Optional - for development)
BREVO_SMTP_USER=your-brevo-email@example.com
BREVO_SMTP_PASSWORD=your-brevo-password
FROM_EMAIL=noreply@westrowkitchen.com

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
```

### 2. Frontend Environment Variables (Client Directory)

Create a `.env` file in the `client/` directory with the following variables:

```bash
# Stripe Public Key (for frontend)
VITE_STRIPE_PUBLIC_KEY=pk_test_your-stripe-public-key

# API Base URL (optional - defaults to current domain)
VITE_API_BASE_URL=http://localhost:3000
```

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Make sure PostgreSQL is running and create the database:

```bash
# Connect to PostgreSQL and create database
createdb westrowkitchen

# Or using psql
psql -U username -c "CREATE DATABASE westrowkitchen;"
```

### 3. Development Mode

```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:3000/api

## Production Deployment

### 1. Build the Application

```bash
npm run build
```

This will:
- Build the React frontend
- Compile the TypeScript server code
- Create optimized production files in the `dist/` directory

### 2. Install PM2 (if not already installed)

```bash
npm install -g pm2
```

### 3. Start with PM2

```bash
pm2 start dist/index.js --name "westrow-kitchen"
```

### 4. PM2 Management Commands

```bash
# View running processes
pm2 list

# View logs
pm2 logs westrow-kitchen

# Restart the application
pm2 restart westrow-kitchen

# Stop the application
pm2 stop westrow-kitchen

# Delete the application from PM2
pm2 delete westrow-kitchen

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

## Environment-Specific Configuration

### Development Environment

- Uses Vite development server with hot reloading
- Connects to local PostgreSQL database
- Uses test Stripe keys
- Email service errors are ignored

### Production Environment

- Serves static files from `dist/public`
- Requires production database
- Uses live Stripe keys
- Email service must be properly configured

## Troubleshooting

### Common Issues

1. **Port 5000 Conflict (macOS)**
   - Port 5000 is used by AirPlay on macOS
   - The application now defaults to port 3000
   - Change the PORT in `.env` if needed

2. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL format
   - Verify database exists and user has permissions

3. **Stripe Errors**
   - Ensure both STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY are set
   - Use test keys for development
   - Keys must match (both test or both live)

4. **Email Service Errors**
   - Email errors are ignored in development
   - Configure BREVO_SMTP_USER and BREVO_SMTP_PASSWORD for production

### File Structure

```
WestRowKitchen/
├── .env                 # Server environment variables
├── client/
│   ├── .env            # Frontend environment variables
│   ├── src/            # React source code
│   └── index.html      # HTML template
├── server/             # Express server code
├── shared/             # Shared TypeScript schemas
├── dist/               # Production build output
└── package.json        # Dependencies and scripts
```

## Security Notes

- Never commit `.env` files to version control
- Use strong SESSION_SECRET in production
- Use environment-specific Stripe keys
- Keep database credentials secure
- Use HTTPS in production

## Support

For issues or questions, please check the troubleshooting section above or refer to the project documentation.
