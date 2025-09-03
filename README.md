# West Row Kitchen - Food Delivery Platform

A comprehensive multi-restaurant food delivery platform built with modern web technologies, featuring real-time order management, secure payments, and professional email communications.

## 🚀 Features

### Customer Features
- **Restaurant Discovery** - Browse local restaurants with cuisine filtering and search
- **Interactive Menus** - View detailed menu items with categories and pricing
- **Smart Cart Management** - Add items, modify quantities, and checkout seamlessly
- **Secure Payments** - Stripe integration for safe payment processing
- **Order Tracking** - Real-time order status updates from confirmation to delivery
- **Email Notifications** - Automated order confirmations and status updates

### Admin Features
- **Restaurant Management** - Complete CRUD operations for restaurant profiles
- **Menu Administration** - Manage categories, items, pricing, and availability
- **Order Oversight** - View and update order statuses across all restaurants
- **Analytics Dashboard** - Track restaurant performance and order metrics
- **Promotion Management** - Create and manage restaurant promotions

### Business Features
- **Multi-Restaurant Support** - Platform supports unlimited restaurants
- **Role-Based Access** - Secure admin and customer user roles
- **Professional Email System** - Brevo SMTP integration for transactional emails
- **Responsive Design** - Optimized for desktop and mobile devices
- **SEO Optimized** - Proper meta tags and search engine optimization

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with shadcn/ui for modern UI components
- **TanStack React Query** for efficient server state management
- **Wouter** for lightweight client-side routing
- **Framer Motion** for smooth animations

### Backend
- **Node.js** with Express.js framework
- **TypeScript** for full-stack type safety
- **PostgreSQL** database with connection pooling
- **Drizzle ORM** for type-safe database operations
- **Passport.js** for authentication middleware
- **Stripe** for payment processing
- **Nodemailer** with Brevo SMTP for email delivery

### Development & Deployment
- **Replit** for cloud development and hosting
- **ESBuild** for fast backend compilation
- **PostCSS** with Autoprefixer for CSS processing
- **Hot Module Replacement** for instant development feedback

## 📦 Installation & Setup

### Prerequisites
- Node.js 20+ 
- PostgreSQL database
- Stripe account (for payments)
- Brevo account (for emails)

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
SESSION_SECRET=your-session-secret
REPL_ID=your-replit-id
ISSUER_URL=your-openid-issuer
REPLIT_DOMAINS=your-allowed-domains

# Payment Processing
STRIPE_SECRET_KEY=sk_test_your-stripe-secret
VITE_STRIPE_PUBLIC_KEY=pk_test_your-stripe-public

# Email Service
BREVO_SMTP_USER=your-brevo-email
BREVO_SMTP_PASSWORD=your-brevo-smtp-password
FROM_EMAIL=noreply@yourdomain.com
```

### Quick Start
```bash
# Install dependencies
npm install

# Set up database schema
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## 🗄 Database Schema

### Core Tables
- **users** - Customer and admin user accounts
- **restaurants** - Restaurant profiles and information
- **menu_categories** - Menu organization (starters, mains, etc.)
- **menu_items** - Individual food items with pricing
- **orders** - Customer orders with delivery details
- **order_items** - Items within each order
- **promotions** - Restaurant promotional offers

### Key Relationships
- Users can place multiple orders
- Restaurants have multiple menu categories
- Categories contain multiple menu items
- Orders contain multiple order items
- Each order belongs to one restaurant and one user

## 🔐 Authentication & Authorization

### User Roles
- **Customer** (`isAdmin: false`) - Browse, order, and track deliveries
- **Admin** (`isAdmin: true`) - Manage restaurants, menus, and orders

### Test Accounts
```bash
# Admin Account
Email: admin@westrowkitchen.com
Password: admin123

# Customer Account  
Email: customer@test.com
Password: customer123
```

## 💳 Payment Integration

### Stripe Setup
- Test mode configured with official Stripe test keys
- Payment Intent creation for secure transactions
- Support for various payment methods
- Automatic receipt generation

### Test Payment
Use test card: `4242 4242 4242 4242` with any future expiry date and CVC.

## 📧 Email System

### Automated Emails
- **Welcome emails** for new user registrations
- **Order confirmations** with detailed summaries
- **Status updates** throughout order lifecycle
- **Professional HTML templates** with brand styling

### Email Triggers
- User registration → Welcome email
- Order placement → Confirmation email
- Status change → Update notification

## 🚀 Deployment

### Replit Deployment
The application is configured for seamless deployment on Replit:

1. Push code to repository
2. Environment variables are configured in Replit
3. Automatic builds and deployments
4. TLS and custom domain support available

### Production Considerations
- Database connection pooling configured
- Session storage in PostgreSQL
- Static asset optimization
- Error monitoring and logging

## 📊 API Endpoints

### Public Endpoints
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `GET /api/restaurants/:id/menu` - Get restaurant menu
- `GET /api/promotions` - Get active promotions

### Authenticated Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `PUT /api/orders/:id/status` - Update order status (admin)
- `POST /api/restaurants` - Create restaurant (admin)

### Payment Endpoints
- `POST /api/create-payment-intent` - Create Stripe payment intent

## 🧪 Testing

### Test Data
The application includes seeded test data:
- 3 sample restaurants with complete menus
- Various menu categories and items
- Admin and customer test accounts

### Manual Testing
1. Browse restaurants as guest user
2. Register new account (receives welcome email)
3. Add items to cart and checkout
4. Admin login to manage orders
5. Test payment flow with Stripe test cards

## 🔧 Development

### Project Structure
```
├── client/          # React frontend application
├── server/          # Express backend API
├── shared/          # Shared types and schemas
├── attached_assets/ # Static images and assets
└── dist/           # Production build output
```

### Key Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Sync database schema
npm run db:studio    # Open database GUI
```

## 📈 Performance

### Optimizations
- **React Query caching** reduces API calls
- **Code splitting** for faster initial loads
- **Image optimization** for quick loading
- **Database indexing** for fast queries
- **Connection pooling** for scalability

### Monitoring
- Server-side error logging
- Email delivery monitoring  
- Payment processing tracking
- Database query performance

## 🤝 Contributing

### Development Workflow
1. Clone repository
2. Install dependencies with `npm install`
3. Set up environment variables
4. Run `npm run db:push` to set up database
5. Start development with `npm run dev`

### Code Standards
- TypeScript for all new code
- ESLint configuration for code quality
- Prettier for consistent formatting
- Conventional commits for clear history

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For technical support or questions:
- Check the internal documentation for detailed technical information
- Review environment variable configuration
- Verify database connection and schema
- Test email service configuration

---

**West Row Kitchen** - Bringing local flavors to your doorstep with technology that just works.