# API Structure for Vercel Deployment

## 📁 API Directory Structure

```
api/
├── _utils/                          # Shared utilities
│   ├── auth.ts                      # Authentication utilities
│   ├── db.ts                        # Database initialization
│   └── env-validator.ts             # Environment validation
│
├── _validate-env.ts                 # Environment validation runner
│
├── auth/                            # Authentication endpoints
│   ├── signin.ts                    # POST /api/auth/signin
│   ├── signup.ts                    # POST /api/auth/signup
│   ├── signout.ts                   # POST /api/auth/signout
│   └── user.ts                      # GET /api/auth/user
│
├── products/                        # Product endpoints
│   ├── index.ts                     # GET /api/products
│   └── [id].ts                      # GET /api/products/:id
│
├── purchases/                       # Purchase endpoints
│   ├── index.ts                     # POST & GET /api/purchases
│   └── bulk.ts                      # POST /api/purchases/bulk
│
├── transactions/                    # Transaction endpoints
│   └── index.ts                     # GET /api/transactions
│
├── deposits/                        # Deposit endpoints
│   ├── initialize.ts                # POST /api/deposits/initialize
│   └── verify.ts                    # POST /api/deposits/verify
│
└── admin/                           # Admin endpoints
    ├── stats.ts                     # GET /api/admin/stats
    ├── all-products.ts              # GET /api/admin/all-products
    ├── all-deposits.ts              # GET /api/admin/all-deposits
    ├── all-purchases.ts             # GET /api/admin/all-purchases
    ├── users.ts                     # GET /api/admin/users
    ├── users/
    │   └── [id]/
    │       └── admin-status.ts      # PATCH /api/admin/users/:id/admin-status
    ├── transactions/
    │   └── [id]/
    │       └── status.ts            # PATCH /api/admin/transactions/:id/status
    └── dashboard/
        └── products/
            ├── [id].ts              # PATCH & DELETE /api/admin/dashboard/products/:id
            └── products.ts          # POST /api/admin/dashboard/products
```

## 🔐 Authentication Pattern

All protected endpoints use the `requireAuth` or `requireAdmin` functions:

```typescript
import { requireAuth } from '../_utils/auth';
import { initDB } from '../_utils/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuth(req, res);
  if (!user) return; // Response already sent with 401

  const db = initDB();
  // Your logic here...
}
```

## 🗄️ Database Pattern

Each serverless function initializes its own database connection:

```typescript
import { initDB } from '../_utils/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = initDB(); // Per-request initialization
  
  // Use db.query or db.insert/update/delete
  const data = await db.query.users.findMany();
  
  return res.status(200).json(data);
}
```

## ✅ Environment Variable Validation

All serverless functions automatically validate environment variables on startup:

- `DATABASE_URL` ✅ Required
- `SUPABASE_URL` ✅ Required
- `SUPABASE_ANON_KEY` ✅ Required
- `SUPABASE_SERVICE_ROLE_KEY` ✅ Required
- `PAYSTACK_SECRET_KEY` ✅ Required
- `ADMIN_API_KEY` ⚠️ Optional
- `NODE_ENV` ⚠️ Optional

Validation logs show:
```
🔍 Validating environment variables...
✅ DATABASE_URL: postgres://... (142 chars)
✅ SUPABASE_URL: https://... (45 chars)
❌ PAYSTACK_SECRET_KEY: MISSING (REQUIRED)
```

If required variables are missing, the deployment will fail with a clear error message.

## 📝 API Endpoints Reference

### Public Endpoints
- `GET /api/products` - List all available products

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/user` - Get current user (requires auth)

### Product Endpoints
- `GET /api/products/:id` - Get product details (requires auth)

### Purchase Endpoints
- `POST /api/purchases` - Purchase single product (requires auth)
- `POST /api/purchases/bulk` - Bulk purchase/cart checkout (requires auth)
- `GET /api/purchases` - Get user purchases with credentials (requires auth)

### Transaction Endpoints
- `GET /api/transactions` - Get user transaction history (requires auth)

### Deposit Endpoints
- `POST /api/deposits/initialize` - Initialize Paystack deposit (requires auth)
- `POST /api/deposits/verify` - Verify Paystack payment (requires auth)

### Admin Endpoints (Require Admin Auth)
- `GET /api/admin/stats` - Get product statistics
- `GET /api/admin/all-products` - Get all products with credentials
- `GET /api/admin/all-deposits` - Get all user deposits
- `GET /api/admin/all-purchases` - Get all purchases
- `GET /api/admin/users` - Get all users
- `POST /api/admin/dashboard/products` - Create new product
- `PATCH /api/admin/dashboard/products/:id` - Update product
- `DELETE /api/admin/dashboard/products/:id` - Delete product
- `PATCH /api/admin/users/:id/admin-status` - Update user admin status
- `PATCH /api/admin/transactions/:id/status` - Update transaction status

## 🚀 Deployment Notes

### Key Differences from Express
1. **No shared state** - Each function is stateless
2. **Per-request DB init** - Database connection created per request
3. **Environment validation** - Automatic validation on function startup
4. **File-based routing** - URL structure matches file structure

### Testing Locally
The project still runs with Express locally (`npm run dev`). Vercel serverless functions are only used in production.

### Vercel Configuration
- Build command: `npm run build --prefix client`
- Output directory: `client/dist`
- Rewrites: API requests to `/api/*` → serverless functions
- Rewrites: All other requests → `client/dist/index.html` (SPA)
