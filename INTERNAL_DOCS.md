# West Row Kitchen - Internal Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Deep Dive](#architecture-deep-dive)
3. [Database Design](#database-design)
4. [Authentication System](#authentication-system)
5. [Email System](#email-system)
6. [Payment Integration](#payment-integration)
7. [API Documentation](#api-documentation)
8. [Frontend Architecture](#frontend-architecture)
9. [Deployment & Infrastructure](#deployment--infrastructure)
10. [Development Guidelines](#development-guidelines)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Security Considerations](#security-considerations)

## Project Overview

### Business Model
Multi-tenant food delivery platform supporting unlimited restaurants with centralized order management and customer base.

### Revenue Streams
- Delivery fees per order
- Service fees (percentage of order value)
- Restaurant commission fees
- Premium restaurant listing fees

### User Journey Flow
1. **Guest/Customer Registration** → Welcome email sent
2. **Restaurant Discovery** → Browse by cuisine, location, ratings
3. **Menu Browsing** → Category-filtered menu items
4. **Cart Management** → Real-time cart updates
5. **Checkout Process** → Address, payment method selection
6. **Payment Processing** → Stripe integration
7. **Order Confirmation** → Email notification sent
8. **Order Tracking** → Status updates with email notifications
9. **Delivery Completion** → Final confirmation email

## Architecture Deep Dive

### Monorepo Structure
```
project-root/
├── client/                 # React frontend (SPA)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route-based page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   └── utils/         # Helper functions
├── server/                # Express backend (API)
│   ├── auth.ts           # Authentication logic
│   ├── email.ts          # Email service integration
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database abstraction layer
│   └── index.ts          # Server entry point
├── shared/               # Shared TypeScript definitions
│   └── schema.ts         # Database schema & types
└── attached_assets/      # Static images and assets
```

### Technology Stack Details

#### Frontend Stack
- **React 18.2** - Latest stable with concurrent features
- **TypeScript 5.0** - Strict type checking enabled
- **Vite 5.0** - Build tool with HMR and optimizations
- **Tailwind CSS 3.4** - Utility-first styling
- **shadcn/ui** - Pre-built accessible components
- **TanStack React Query v5** - Server state management
- **Wouter 3.0** - Lightweight routing (2KB)
- **Framer Motion 11** - Smooth animations

#### Backend Stack
- **Node.js 20.19** - LTS version with ES modules
- **Express.js 4.19** - Web framework with middleware
- **TypeScript 5.0** - Compiled with ESBuild
- **Drizzle ORM 0.33** - Type-safe database operations
- **PostgreSQL 15+** - Primary database
- **Passport.js** - Authentication middleware
- **Express Session** - Server-side session management
- **Stripe Node.js SDK** - Payment processing
- **Nodemailer** - Email delivery service

### Build & Development Process

#### Development Mode
```bash
npm run dev
# Concurrent processes:
# 1. Vite dev server (port 3000) - HMR for React
# 2. Express server (port 5000) - API with nodemon
# 3. TypeScript watch - Real-time compilation
```

#### Production Build
```bash
npm run build
# Process:
# 1. Vite builds client to dist/public/
# 2. ESBuild compiles server to dist/index.js
# 3. Static files served by Express
# 4. Single Node.js process handles everything
```

## Database Design

### Schema Architecture

#### Core Tables Design Philosophy
- **UUID Primary Keys** for security and distributed systems
- **Timestamps** for audit trails and debugging
- **Soft Deletes** where business logic requires (future enhancement)
- **Normalized Design** to prevent data redundancy
- **Foreign Key Constraints** for data integrity

#### Table Relationships
```sql
users (1) ←→ (many) orders
restaurants (1) ←→ (many) menu_categories
restaurants (1) ←→ (many) orders
menu_categories (1) ←→ (many) menu_items
orders (1) ←→ (many) order_items
menu_items (1) ←→ (many) order_items
restaurants (1) ←→ (many) promotions
```

#### Detailed Schema

##### Users Table
```typescript
users {
  id: varchar (UUID) PRIMARY KEY
  email: varchar UNIQUE NOT NULL
  password: varchar NOT NULL (hashed with scrypt)
  firstName: varchar NOT NULL
  lastName: varchar NOT NULL
  isAdmin: boolean DEFAULT false
  createdAt: timestamp DEFAULT now()
  updatedAt: timestamp DEFAULT now()
}
```

##### Restaurants Table
```typescript
restaurants {
  id: varchar (UUID) PRIMARY KEY
  name: varchar NOT NULL
  description: text
  cuisine: varchar NOT NULL
  address: varchar NOT NULL
  phone: varchar
  email: varchar
  rating: decimal(2,1) DEFAULT 0.0
  reviewCount: integer DEFAULT 0
  deliveryTime: varchar NOT NULL
  deliveryFee: decimal(10,2) NOT NULL
  minimumOrder: decimal(10,2) DEFAULT 0
  isOpen: boolean DEFAULT true
  image: varchar (URL)
  createdAt: timestamp DEFAULT now()
  updatedAt: timestamp DEFAULT now()
}
```

##### Orders Table
```typescript
orders {
  id: varchar (UUID) PRIMARY KEY
  userId: varchar REFERENCES users(id)
  restaurantId: varchar REFERENCES restaurants(id)
  status: varchar DEFAULT 'pending'
  totalAmount: decimal(10,2) NOT NULL
  deliveryAddress: text NOT NULL
  deliveryInstructions: text
  paymentMethod: varchar NOT NULL
  estimatedDeliveryTime: varchar
  createdAt: timestamp DEFAULT now()
  updatedAt: timestamp DEFAULT now()
}
```

### Database Performance Optimizations

#### Indexes
```sql
-- Performance critical indexes
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine);
CREATE INDEX idx_restaurants_is_open ON restaurants(isOpen);
CREATE INDEX idx_orders_user_id ON orders(userId);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurantId);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(createdAt);
CREATE INDEX idx_menu_items_category_id ON menu_items(categoryId);
CREATE INDEX idx_menu_items_is_available ON menu_items(isAvailable);
```

#### Query Optimization Strategies
- **Eager Loading** - Join related tables in single queries
- **Pagination** - Limit results with OFFSET/LIMIT
- **Connection Pooling** - Reuse database connections
- **Query Caching** - Cache frequent read operations

### Migration Strategy
- **Drizzle Kit** manages schema changes
- **`npm run db:push`** syncs development schema
- **No manual SQL migrations** - Drizzle generates them
- **Force push** for development: `npm run db:push --force`

## Authentication System

### Authentication Flow

#### Session-Based Authentication
```typescript
// Session configuration
{
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: PostgreSQLStore, // Sessions stored in DB
  cookie: {
    httpOnly: true,
    secure: false, // true in production with HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
  }
}
```

#### Password Security
```typescript
// Using Node.js built-in scrypt for password hashing
const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
};

const comparePasswords = async (supplied: string, stored: string) => {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
};
```

#### Role-Based Access Control
```typescript
// Middleware for protected routes
const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Admin-only routes
const requireAdmin = async (req, res, next) => {
  const user = await storage.getUser(req.user.id);
  if (!user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
```

### User Management

#### Registration Process
1. **Validation** - Email format, password strength (6+ chars)
2. **Duplicate Check** - Prevent email collisions
3. **Password Hashing** - Secure storage with salt
4. **Database Insert** - Create user record
5. **Session Creation** - Auto-login after registration
6. **Welcome Email** - Async email delivery

#### Login Process
1. **Credential Validation** - Email and password verification
2. **Password Comparison** - Constant-time comparison
3. **Session Creation** - Server-side session establishment
4. **User Data Return** - Safe user object (no password)

## Email System

### Brevo SMTP Integration

#### Configuration
```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
});
```

#### Email Templates

##### Order Confirmation Template
- **Responsive HTML design** with inline CSS
- **Order summary table** with itemized pricing
- **Restaurant branding** with dynamic content
- **Delivery information** and estimated times
- **Professional styling** matching brand colors

##### Order Status Template
- **Dynamic status messaging** based on order state
- **Color-coded status indicators** for visual clarity
- **Consistent branding** across all communications
- **Mobile-optimized** for smartphone viewing

##### Welcome Email Template
- **Onboarding messaging** for new users
- **Call-to-action buttons** to browse restaurants
- **Brand introduction** and value proposition
- **Professional design** establishing trust

#### Email Delivery Strategy

##### Non-Blocking Delivery
```typescript
// Email failures don't affect core application flow
try {
  await sendOrderConfirmationEmail(order, restaurant, user);
} catch (emailError) {
  console.error('Email delivery failed:', emailError);
  // Application continues normally
}
```

##### Error Handling
- **Graceful Degradation** - App works without email service
- **Detailed Logging** - Track delivery failures for debugging
- **Retry Logic** - Future enhancement for failed deliveries
- **Health Monitoring** - Connection testing on startup

#### Email Triggers
1. **User Registration** → Welcome email
2. **Order Placement** → Confirmation email
3. **Status Update** → Progress notification
4. **Delivery Completion** → Final confirmation

## Payment Integration

### Stripe Implementation

#### Payment Intent Flow
```typescript
// Server-side payment intent creation
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amount * 100), // Convert to cents
  currency: 'usd',
  metadata: { orderId: order.id }
});
```

#### Client-Side Integration
```typescript
// React Stripe Elements integration
<Elements stripe={stripePromise} options={{ clientSecret }}>
  <PaymentElement />
  <button onClick={handlePayment}>
    Pay ${total.toFixed(2)}
  </button>
</Elements>
```

#### Security Measures
- **Server-side amount calculation** - Prevent tampering
- **Payment intent confirmation** - Secure payment flow
- **Test mode configuration** - Safe development testing
- **Error handling** - User-friendly error messages

#### Test Configuration
```typescript
// Test credentials for development
const STRIPE_TEST_SECRET = 'sk_test_4eC39HqLyjWDarjtT1zdp7dc';
const STRIPE_TEST_PUBLIC = 'pk_test_4eC39HqLyjWDarjtT1zdp7dc';

// Test card numbers
4242 4242 4242 4242 // Visa - Success
4000 0000 0000 0002 // Visa - Declined
4000 0000 0000 9995 // Visa - Insufficient funds
```

## API Documentation

### Authentication Endpoints

#### POST /api/register
```typescript
Request: {
  firstName: string,
  lastName: string,
  email: string,
  password: string
}
Response: {
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  isAdmin: boolean
}
```

#### POST /api/login
```typescript
Request: {
  email: string,
  password: string
}
Response: {
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  isAdmin: boolean
}
```

### Restaurant Endpoints

#### GET /api/restaurants
```typescript
Query: {
  cuisine?: string // Filter by cuisine type
}
Response: Restaurant[]
```

#### POST /api/restaurants (Admin Only)
```typescript
Request: {
  name: string,
  description: string,
  cuisine: string,
  address: string,
  phone: string,
  deliveryTime: string,
  deliveryFee: number
}
Response: Restaurant
```

### Order Endpoints

#### POST /api/orders (Authenticated)
```typescript
Request: {
  restaurantId: string,
  items: OrderItem[],
  totalAmount: number,
  deliveryAddress: string,
  paymentMethod: string
}
Response: {
  order: Order,
  items: OrderItem[]
}
```

#### PUT /api/orders/:id/status (Admin Only)
```typescript
Request: {
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
}
Response: Order
```

### Error Response Format
```typescript
{
  message: string,
  errors?: ValidationError[] // For validation failures
}
```

## Frontend Architecture

### Component Organization

#### Page Components (`client/src/pages/`)
- **Landing.tsx** - Marketing homepage for guests
- **Home.tsx** - Dashboard for authenticated users
- **Restaurants.tsx** - Restaurant listing and filtering
- **Restaurant.tsx** - Single restaurant menu view
- **Checkout.tsx** - Order review and payment
- **Admin.tsx** - Administrative dashboard
- **Orders.tsx** - Order history and tracking

#### Shared Components (`client/src/components/`)
- **NavigationHeader.tsx** - Top navigation bar
- **Footer.tsx** - Site footer with links
- **RestaurantCard.tsx** - Restaurant display card
- **CartSidebar.tsx** - Shopping cart overlay
- **UI Components** - shadcn/ui component library

### State Management Strategy

#### React Query Implementation
```typescript
// Restaurant data fetching
const { data: restaurants, isLoading } = useQuery({
  queryKey: ['/api/restaurants', cuisine],
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Order creation mutation
const createOrderMutation = useMutation({
  mutationFn: (orderData) => apiRequest('POST', '/api/orders', orderData),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    toast({ title: 'Order placed successfully!' });
  }
});
```

#### Local State Management
- **useState** for component-level state
- **useContext** for cart management (future enhancement)
- **Session storage** for cart persistence
- **URL state** for filters and pagination

### Routing Strategy

#### Wouter Configuration
```typescript
// Route definitions
<Switch>
  <Route path="/" component={isAuthenticated ? Home : Landing} />
  <Route path="/restaurants" component={Restaurants} />
  <Route path="/restaurant/:slug" component={Restaurant} />
  <Route path="/checkout" component={Checkout} />
  <Route path="/admin" component={requireAdmin(Admin)} />
  <Route component={NotFound} />
</Switch>
```

#### SEO Optimization
- **Dynamic meta tags** for each restaurant
- **Structured data** for rich snippets
- **Open Graph tags** for social sharing
- **Descriptive URLs** with restaurant slugs

### Performance Optimizations

#### Code Splitting
```typescript
// Lazy loading for admin routes
const Admin = lazy(() => import('@/pages/admin'));
const StripeCheckout = lazy(() => import('@/pages/stripe-checkout'));
```

#### Asset Optimization
- **Vite asset handling** for images and static files
- **SVG icons** for scalable graphics
- **Responsive images** with proper sizing
- **Lazy loading** for below-fold content

## Deployment & Infrastructure

### Replit Configuration

#### Environment Setup
```bash
# .replit configuration
[nix]
channel = "stable-23.11"

[deployment]
run = ["npm", "run", "start"]
deploymentTarget = "cloudrun"

[[ports]]
localPort = 5000
externalPort = 80
```

#### Build Process
```bash
# Production build command
npm run build

# Builds:
# - client/ → dist/public/ (Vite)
# - server/ → dist/index.js (ESBuild)
# - Serves static files from Express
```

### Production Environment

#### Environment Variables
```bash
# Required for production
DATABASE_URL=postgresql://...
SESSION_SECRET=crypto-strong-secret
STRIPE_SECRET_KEY=sk_live_...
BREVO_SMTP_USER=production-email
BREVO_SMTP_PASSWORD=production-password
FROM_EMAIL=noreply@yourdomain.com
```

#### Security Headers
```typescript
// Production security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      frameSrc: ["https://js.stripe.com"],
    }
  }
}));
```

#### Performance Monitoring
- **Response time logging** for API endpoints
- **Database query monitoring** with slow query alerts
- **Email delivery tracking** with failure notifications
- **Payment processing monitoring** for transaction success rates

## Development Guidelines

### Code Standards

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true
  }
}
```

#### Naming Conventions
- **PascalCase** for components and types
- **camelCase** for functions and variables
- **kebab-case** for file names
- **UPPER_SNAKE_CASE** for environment variables

#### Error Handling Patterns
```typescript
// API route error handling
try {
  const result = await operation();
  res.json(result);
} catch (error) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ 
      message: "Invalid data", 
      errors: error.errors 
    });
  }
  console.error("Operation failed:", error);
  res.status(500).json({ message: "Internal server error" });
}
```

### Testing Strategy

#### Manual Testing Checklist
1. **User Registration** - Email delivery verification
2. **Authentication Flow** - Login/logout functionality
3. **Restaurant Browsing** - Filtering and search
4. **Order Placement** - Cart to payment completion
5. **Admin Functions** - Restaurant and order management
6. **Email Notifications** - All trigger points
7. **Payment Processing** - Test card transactions

#### Test Data Management
```sql
-- Test accounts created
INSERT INTO users VALUES
('admin@westrowkitchen.com', 'admin123', 'Admin', 'User', true),
('customer@test.com', 'customer123', 'Test', 'Customer', false);
```

### Database Management

#### Schema Updates
```bash
# Development schema changes
npm run db:push

# Production schema changes (requires careful planning)
npm run db:push --force # Only in emergencies
```

#### Data Seeding
```typescript
// Sample restaurant data
const seedRestaurants = [
  {
    name: "Cheeky's Burgers",
    cuisine: "American",
    rating: 4.8,
    deliveryTime: "15-25 min",
    deliveryFee: 1.49
  }
  // ... more restaurants
];
```

## Troubleshooting Guide

### Common Issues

#### Database Connection Issues
```bash
# Check database URL format
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Test connection
npm run db:studio

# Reset schema (development only)
npm run db:push --force
```

#### Email Service Issues
```bash
# Verify SMTP credentials
BREVO_SMTP_USER=your-email@domain.com
BREVO_SMTP_PASSWORD=your-smtp-password

# Test email connection
curl -X POST localhost:5000/api/test-email
```

#### Payment Processing Issues
```bash
# Verify Stripe keys match
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Test payment intent creation
curl -X POST localhost:5000/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 25.99}'
```

#### Authentication Issues
```bash
# Check session secret is set
SESSION_SECRET=your-secret-key

# Verify user exists in database
SELECT * FROM users WHERE email = 'test@example.com';

# Clear sessions (development)
DELETE FROM sessions;
```

### Performance Issues

#### Slow API Responses
1. **Check database indexes** - Ensure proper indexing
2. **Monitor query performance** - Use EXPLAIN ANALYZE
3. **Connection pooling** - Verify pool size settings
4. **Network latency** - Test from different locations

#### High Memory Usage
1. **Database connections** - Check for connection leaks
2. **React Query cache** - Monitor cache size
3. **Image assets** - Optimize large images
4. **Memory leaks** - Profile with Node.js inspector

### Deployment Issues

#### Build Failures
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check

# Verify environment variables
echo $DATABASE_URL
```

#### Runtime Errors
```bash
# Check server logs
tail -f /var/log/app.log

# Monitor database connections
SELECT * FROM pg_stat_activity;

# Verify email service
npm run test-email
```

## Security Considerations

### Authentication Security
- **Password hashing** with scrypt and salt
- **Session security** with httpOnly cookies
- **CSRF protection** with session-based tokens
- **Rate limiting** on authentication endpoints (future)

### Data Protection
- **Input validation** with Zod schemas
- **SQL injection prevention** via parameterized queries
- **XSS protection** with proper escaping
- **Sensitive data masking** in logs

### Payment Security
- **PCI compliance** via Stripe (no card data stored)
- **Server-side validation** of payment amounts
- **Secure payment flow** with payment intents
- **Test mode separation** for development

### Email Security
- **SMTP authentication** with Brevo credentials
- **Template injection prevention** via sanitization
- **Rate limiting** on email sending (future)
- **Bounce handling** for invalid addresses (future)

---

## Change Log

### Recent Updates
- **2025-09-03**: Transactional email system implemented with Brevo SMTP
- **2025-09-03**: Restaurant page filter functionality fixed
- **2025-09-03**: Stripe checkout routing issues resolved
- **2025-09-03**: Test admin and customer accounts created
- **2025-09-03**: Hero section design improvements completed

### Future Enhancements
- Real-time order tracking with WebSockets
- Push notification system for mobile apps
- Advanced analytics dashboard
- Multi-language support
- Restaurant onboarding workflow
- Customer review and rating system
- Loyalty program and rewards
- Advanced search with geolocation
- Social media integration
- Advanced reporting and analytics

---

This documentation serves as the comprehensive technical reference for the West Row Kitchen platform. Keep it updated as the system evolves and new features are added.