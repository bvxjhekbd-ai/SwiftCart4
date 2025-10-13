# API Migration Guide - Consolidated Endpoints for Vercel

## Overview
The API has been consolidated from 24 separate endpoint files to **6 unified endpoints** to comply with Vercel's free tier limit of 12 serverless functions.

## New API Structure

### 1. Authentication - `/api/auth`
| Old Endpoint | New Endpoint | Method |
|-------------|--------------|--------|
| `/api/auth/signin` | `/api/auth?action=signin` | POST |
| `/api/auth/signup` | `/api/auth?action=signup` | POST |
| `/api/auth/signout` | `/api/auth?action=signout` | POST |
| `/api/auth/user` | `/api/auth?action=user` | GET |

**Example:**
```typescript
// Old
const response = await fetch('/api/auth/signin', { method: 'POST', ... });

// New
const response = await fetch('/api/auth?action=signin', { method: 'POST', ... });
```

### 2. Products - `/api/products`
| Old Endpoint | New Endpoint | Method |
|-------------|--------------|--------|
| `/api/products` | `/api/products` | GET |
| `/api/products/:id` | `/api/products?id=xxx` | GET |

**Example:**
```typescript
// Old
const response = await fetch('/api/products/123');

// New
const response = await fetch('/api/products?id=123');
```

### 3. Deposits - `/api/deposits`
| Old Endpoint | New Endpoint | Method |
|-------------|--------------|--------|
| `/api/deposits/initialize` | `/api/deposits?action=initialize` | POST |
| `/api/deposits/verify` | `/api/deposits?action=verify` | POST |

**Example:**
```typescript
// Old
const response = await fetch('/api/deposits/initialize', { method: 'POST', ... });

// New
const response = await fetch('/api/deposits?action=initialize', { method: 'POST', ... });
```

### 4. Purchases - `/api/purchases`
| Old Endpoint | New Endpoint | Method |
|-------------|--------------|--------|
| `/api/purchases` (GET) | `/api/purchases` | GET |
| `/api/purchases` (POST) | `/api/purchases` | POST |
| `/api/purchases/bulk` | `/api/purchases?action=bulk` | POST |

**Example:**
```typescript
// Old
const response = await fetch('/api/purchases/bulk', { method: 'POST', ... });

// New
const response = await fetch('/api/purchases?action=bulk', { method: 'POST', ... });
```

### 5. Transactions - `/api/transactions`
| Old Endpoint | New Endpoint | Method |
|-------------|--------------|--------|
| `/api/transactions` | `/api/transactions` | GET |

**Example:**
```typescript
// No changes needed - endpoint remains the same
const response = await fetch('/api/transactions');
```

### 6. Admin - `/api/admin`
| Old Endpoint | New Endpoint | Method |
|-------------|--------------|--------|
| `/api/admin/stats` | `/api/admin?action=stats` | GET |
| `/api/admin/users` | `/api/admin?action=users` | GET |
| `/api/admin/all-products` | `/api/admin?action=all-products` | GET |
| `/api/admin/all-deposits` | `/api/admin?action=all-deposits` | GET |
| `/api/admin/all-purchases` | `/api/admin?action=all-purchases` | GET |
| `/api/admin/dashboard/products` | `/api/admin?action=create-product` | POST |
| `/api/admin/dashboard/products/:id` | `/api/admin?action=update-product&id=xxx` | PATCH |
| `/api/admin/dashboard/products/:id` | `/api/admin?action=delete-product&id=xxx` | DELETE |
| `/api/admin/transactions/:id/status` | `/api/admin?action=update-transaction-status&id=xxx` | PATCH |
| `/api/admin/users/:id/admin-status` | `/api/admin?action=update-user-admin-status&id=xxx` | PATCH |

**Example:**
```typescript
// Old
const response = await fetch('/api/admin/dashboard/products', { method: 'POST', ... });

// New
const response = await fetch('/api/admin?action=create-product', { method: 'POST', ... });

// Old (with ID)
const response = await fetch(`/api/admin/dashboard/products/${id}`, { method: 'PATCH', ... });

// New (with ID)
const response = await fetch(`/api/admin?action=update-product&id=${id}`, { method: 'PATCH', ... });
```

## Frontend Migration Steps

### Step 1: Update API Calls
Search for all API calls in the frontend and update them according to the mapping above.

### Step 2: Update Query Keys (React Query)
```typescript
// Old
const { data } = useQuery({ queryKey: ['/api/products', id] });

// New - Update to match new endpoint structure
const { data } = useQuery({ queryKey: ['/api/products', { id }] });
```

### Step 3: Test All Endpoints
- [ ] Authentication (signin, signup, signout, user)
- [ ] Products (list, detail)
- [ ] Deposits (initialize, verify)
- [ ] Purchases (create, bulk, list)
- [ ] Transactions (list)
- [ ] Admin (all endpoints)

## Benefits
1. **Vercel Compatibility**: Now uses only 6 serverless functions (well under the 12 limit)
2. **Easier Maintenance**: Related endpoints grouped together
3. **Consistent Pattern**: All actions use query parameters
4. **Same Functionality**: All features preserved, just reorganized

## Deployment Status
✅ Consolidated API endpoints created
✅ Old API directories excluded via `.vercelignore`
✅ Ready for Vercel deployment

## Next Steps
1. Update frontend API calls to use new query parameter structure
2. Test locally to ensure all endpoints work
3. Deploy to Vercel
4. Verify all functionality in production
