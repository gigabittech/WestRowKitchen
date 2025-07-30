# West Row Kitchen - Food Delivery Platform

## Overview

West Row Kitchen is a comprehensive food delivery platform that connects customers with local restaurants. The application is built as a full-stack web solution with a React frontend and Express backend, featuring real-time order management, restaurant administration, and secure payment processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **Build Tool**: Vite for development and build processes

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit-based OpenID Connect authentication
- **Session Management**: Express sessions with PostgreSQL storage

### Database Architecture
- **Database**: PostgreSQL (configured via Drizzle ORM)
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Handled through drizzle-kit

## Key Components

### Authentication System
- Replit OpenID Connect integration for user authentication
- Session-based authentication with PostgreSQL session storage
- User profile management with admin role support
- Automatic redirection for unauthorized access

### Restaurant Management
- Complete CRUD operations for restaurants
- Menu category and item management
- Restaurant rating and review system
- Cuisine-based filtering and search functionality

### Order Management
- End-to-end order processing workflow
- Order status tracking (pending, confirmed, preparing, ready, delivered, cancelled)
- User order history and tracking
- Real-time order updates

### Payment Integration
- Stripe payment processing setup
- Order total calculation including delivery fees, service fees, and taxes
- Secure checkout flow

### Admin Dashboard
- Restaurant management interface
- Menu item administration
- Order oversight and management
- User administration capabilities

## Data Flow

### User Authentication Flow
1. User attempts to access protected routes
2. System checks for valid session
3. If unauthorized, redirects to Replit OAuth
4. Upon successful authentication, creates/updates user profile
5. Session established with role-based permissions

### Order Processing Flow
1. Customer browses restaurants and adds items to cart
2. Checkout process calculates totals and processes payment
3. Order created with "pending" status
4. Restaurant receives order notification
5. Order status updates tracked through completion
6. Customer receives delivery confirmation

### Restaurant Data Flow
1. Admin creates/updates restaurant profiles
2. Restaurant managers add menu categories and items
3. Customers filter and search restaurants by cuisine
4. Real-time availability and status updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **@stripe/stripe-js & @stripe/react-stripe-js**: Payment processing
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: UI component primitives
- **drizzle-orm & drizzle-kit**: Database ORM and migrations

### Authentication
- **openid-client**: OpenID Connect client implementation
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-***: Replit-specific development plugins

## Deployment Strategy

### Development Environment
- Vite development server with hot module replacement
- TypeScript compilation with strict mode enabled
- Replit-specific plugins for enhanced development experience

### Production Build
- Vite builds optimized client bundle to `dist/public`
- ESBuild compiles server code to `dist/index.js`
- Single Node.js process serves both static files and API

### Database Management
- Drizzle migrations manage schema changes
- Environment-based database URL configuration
- PostgreSQL connection pooling for production scalability

### Key Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit instance identifier
- `ISSUER_URL`: OpenID Connect provider URL
- `REPLIT_DOMAINS`: Allowed domains for authentication

The application follows a monorepo structure with clear separation between client, server, and shared code, enabling maintainable development while supporting both development and production deployment scenarios.