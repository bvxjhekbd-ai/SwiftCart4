# Digital Marketplace - E-Commerce Platform

## Overview
A full-featured e-commerce platform for buying and selling social media accounts. Built with React, Express, PostgreSQL, and Replit Auth.

## Key Features
- **Authentication**: Replit Auth with Google, GitHub, X, Apple, and email/password support
- **Wallet System**: Users can deposit funds (₦100 - ₦1,000,000) via Paystack
- **Product Management**: Buy and sell social media accounts with secure credential delivery
- **Purchase History**: View all purchased accounts with full login credentials
- **Transaction History**: Track deposits and purchases
- **Admin Endpoint**: Secret API for posting products

## Architecture
### Database Schema
- `users`: User profiles with wallet balance
- `products`: Social media accounts for sale (with credentials)
- `purchases`: Records of user purchases
- `transactions`: Deposit and purchase history
- `sessions`: Replit Auth session storage

### Authentication Flow
1. Users log in via Replit Auth (`/api/login`)
2. Session stored in PostgreSQL
3. Protected routes use `isAuthenticated` middleware
4. User data includes wallet balance

### Purchase Flow
1. User deposits funds via Paystack
2. Browse available products
3. Purchase with wallet balance
4. Instant credential delivery
5. Product marked as sold

## API Endpoints

### Public Endpoints
- `GET /api/products` - List available products
- `GET /api/products/:id` - Get product details (no credentials)

### Protected Endpoints (Require Auth)
- `GET /api/auth/user` - Get current user
- `POST /api/purchases` - Purchase a product
- `GET /api/purchases` - Get user's purchased products (with credentials)
- `GET /api/transactions` - Get user's transaction history
- `POST /api/deposits/initialize` - Initialize Paystack deposit
- `POST /api/deposits/verify` - Verify Paystack payment

### Admin Endpoint
- `POST /api/admin/products` - Create product (requires API key)
  - Header: `x-api-key: your-secret-admin-key-change-this`
  - Set `ADMIN_API_KEY` environment variable with your secret

### Admin API Usage Example
```bash
curl -X POST https://your-app.replit.app/api/admin/products \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key" \
  -d '{
    "title": "Instagram Account - 10k Followers",
    "description": "Verified account with active engagement",
    "price": 15000,
    "category": "instagram",
    "images": ["https://example.com/image.jpg"],
    "accountUsername": "username123",
    "accountPassword": "securePassword123",
    "accountEmail": "account@email.com",
    "additionalInfo": "Recovery email: recovery@email.com",
    "status": "available"
  }'
```

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection (auto-configured)
- `SESSION_SECRET` - Session encryption key (auto-configured)
- `ADMIN_API_KEY` - Secret key for admin product posting
- `VITE_PAYSTACK_PUBLIC_KEY` - Paystack public key for frontend

## Deployment Notes
- Compatible with Vercel deployment
- Uses PostgreSQL for data persistence
- Replit Auth handles authentication
- Paystack integration for payments (₦100 - ₦1,000,000 limits enforced)

## User Flow
1. **Landing Page** - Logged-out users see landing page
2. **Login** - Click "Login / Sign Up" → Replit Auth flow
3. **Deposit** - Add funds to wallet via Paystack
4. **Browse** - View available products
5. **Purchase** - Buy with wallet balance
6. **View Credentials** - Access purchased account details in "My Purchases"

## Admin Endpoint Details

### POST /api/admin/products
**Purpose**: Add new social media accounts for sale  
**Authentication**: Requires `x-api-key` header with value from `ADMIN_API_KEY` environment variable

**Required Fields** (All validated):
- `title` (string): Product title
- `description` (string): Product description
- `price` (number): Price in Naira (integer)
- `category` (string): Category (e.g., "instagram", "twitter", "tiktok", "facebook", "linkedin")
- `images` (array): Array of image URLs
- `accountUsername` (string, required): Social media account username
- `accountPassword` (string, required): Social media account password
- `accountEmail` (string, optional): Associated email for account
- `additionalInfo` (string, optional): Recovery info or other details
- `status` (string, default: "available"): Product status

**Validation**: All social media credentials are validated - username and password are required, email must be valid format if provided.

**Example Request**:
```bash
curl -X POST https://your-app.replit.app/api/admin/products \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_ADMIN_API_KEY" \
  -d '{
    "title": "Instagram Account - 10k Followers",
    "description": "Verified account with active engagement",
    "price": 15000,
    "category": "instagram",
    "images": ["https://example.com/image.jpg"],
    "accountUsername": "username123",
    "accountPassword": "securePassword123",
    "accountEmail": "account@email.com",
    "additionalInfo": "Recovery email: recovery@email.com"
  }'
```

## API Validation
All endpoints now include comprehensive validation:
- **Purchase requests**: Product ID must be valid UUID format
- **Deposit initialize**: Amount must be integer between ₦100 and ₦1,000,000
- **Deposit verify**: Reference required, amount must be positive integer
- **Admin products**: Full social media account validation (username, password, email format)

## Recent Changes
- **Fixed critical security bug**: Implemented server-side Paystack payment verification
- **Added comprehensive validators**: All API endpoints now validate request data
- **Fixed database setup**: Properly configured PostgreSQL with schema migration
- **Added social media account validation**: Ensures all products have required credentials
- **Enhanced error handling**: Clear error messages for validation failures
- Implemented full authentication with Replit Auth
- Added wallet-based payment system
- Created deposit system with Paystack integration
- Built purchase flow with instant credential delivery
- Added transaction and purchase history tracking
- Created secret admin endpoint for product posting
