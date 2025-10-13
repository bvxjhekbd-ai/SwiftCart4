# 🚀 SwiftCart4 - Complete Vercel Conversion Guide

**For Developers: How to Convert SwiftCart E-Commerce from Replit/Express to Vercel**

---

## 📋 Table of Contents
1. [Understanding the Change](#understanding-the-change)
2. [Project Structure Transformation](#project-structure-transformation)
3. [Step-by-Step Conversion Process](#step-by-step-conversion-process)
4. [Configuration Files](#configuration-files)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [Deployment Checklist](#deployment-checklist)

---

## 🎯 Understanding the Change

### What's Changing?
- **FROM:** Express server running continuously on Replit
- **TO:** Serverless functions running on-demand on Vercel

### Why This Matters
- **Express:** One server handles all requests (like a restaurant with one chef)
- **Vercel:** Each request gets its own function instance (like having unlimited chefs)

### Key Differences

| Express (Old) | Vercel (New) |
|--------------|-------------|
| `server/index.ts` with `app.listen()` | Individual `api/*.js` functions |
| Shared database connection | Per-request DB initialization |
| Long-running process | Stateless, ephemeral functions |
| `app.get('/api/products')` | `api/products.js` with `export default handler` |

---

## 📁 Project Structure Transformation

### Current Structure (Express)
```
SwiftCart4/
├── server/
│   ├── index.ts          ← Express server (remove from deployment)
│   ├── routes.ts         ← API routes (convert to serverless)
│   └── middleware/
├── client/               ← React frontend
├── shared/              ← Database schema & types
└── package.json         ← Root config
```

### Target Structure (Vercel)
```
SwiftCart4/
├── api/                 ← Serverless functions (NEW)
│   ├── products/
│   │   ├── [id].js     ← GET /api/products/:id
│   │   └── index.js    ← GET /api/products
│   ├── cart/
│   │   ├── add.js      ← POST /api/cart/add
│   │   └── checkout.js ← POST /api/cart/checkout
│   ├── admin/
│   │   ├── products.js ← POST /api/admin/products
│   │   └── users.js    ← GET /api/admin/users
│   └── auth/
│       ├── login.js    ← POST /api/auth/login
│       └── signup.js   ← POST /api/auth/signup
├── client/             ← React frontend (keep as-is)
├── shared/            ← Database schema (keep as-is)
└── vercel.json        ← Vercel config (CRITICAL)
```

---

## 🔧 Step-by-Step Conversion Process

### Step 1: Convert Express Routes to Serverless Functions

#### Before (Express Route):
```javascript
// server/routes.ts
app.get('/api/products', async (req, res) => {
  const products = await db.select().from(productsTable);
  res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const product = await db.select()
    .from(productsTable)
    .where(eq(productsTable.id, id));
  res.json(product);
});
```

#### After (Vercel Functions):

**File: `api/products/index.js`**
```javascript
import { neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../../shared/schema';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

export default async function handler(req, res) {
  // 1. Method validation
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 2. Initialize DB per request
    const db = drizzle(process.env.DATABASE_URL, { schema });
    
    // 3. Query database
    const products = await db.select().from(schema.products);
    
    // 4. Return response
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

**File: `api/products/[id].js`**
```javascript
import { neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const db = drizzle(process.env.DATABASE_URL, { schema });
    const product = await db.select()
      .from(schema.products)
      .where(eq(schema.products.id, id))
      .limit(1);

    if (!product.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Step 2: Handle Authentication

**File: `api/auth/login.js`**
```javascript
import { neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as schema from '../../shared/schema';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  try {
    const db = drizzle(process.env.DATABASE_URL, { schema });
    
    // Find user
    const users = await db.select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (!users.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Step 3: Handle Payment Processing (Stripe Example)

**File: `api/cart/checkout.js`**
```javascript
import Stripe from 'stripe';
import { neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../../shared/schema';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items, userId } = req.body;

  try {
    const db = drizzle(process.env.DATABASE_URL, { schema });

    // Calculate total
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      metadata: { userId }
    });

    // Create order record
    const order = await db.insert(schema.orders).values({
      userId,
      total,
      status: 'pending',
      paymentIntentId: paymentIntent.id
    }).returning();

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      orderId: order[0].id
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## ⚙️ Configuration Files

### 1. vercel.json (Root Directory)

```json
{
  "buildCommand": "npm run build --prefix client",
  "installCommand": "npm install --prefix client",
  "outputDirectory": "client/dist",
  "rewrites": [
    { 
      "source": "/api/:path*", 
      "destination": "/api/:path*" 
    },
    { 
      "source": "/:path*", 
      "destination": "/client/dist/index.html" 
    }
  ],
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. Client Configuration

**Move config files TO client directory:**

**`client/postcss.config.js`**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**`client/tailwind.config.ts`**
```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      // Your theme config
    },
  },
  plugins: [],
} satisfies Config;
```

### 3. Environment Variables Setup

**Local Development (.env):**
```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

**Vercel Dashboard:**
- Go to Project Settings → Environment Variables
- Add all variables from `.env`
- Set for Production, Preview, and Development

---

## 🔄 Database & Authentication Patterns

### Database Pattern (For Every API Function)

```javascript
import { neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../../shared/schema';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

export default async function handler(req, res) {
  // Initialize DB per request (serverless-safe)
  const db = drizzle(process.env.DATABASE_URL, { schema });
  
  // Your logic here
  
  // No need to close connection - Vercel handles it
}
```

### Authentication Middleware Pattern

**File: `api/_middleware/auth.js`**
```javascript
import jwt from 'jsonwebtoken';

export function verifyToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

**Use in protected routes:**
```javascript
import { verifyToken } from '../_middleware/auth';

export default async function handler(req, res) {
  try {
    const user = verifyToken(req);
    // User is authenticated, proceed with logic
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot find module 'tailwindcss'"
**Solution:** Move `postcss.config.js` and `tailwind.config.ts` to `client/` directory

### Issue 2: "Database connection failed"
**Solution:** 
- Ensure `DATABASE_URL` is set in Vercel environment variables
- Use Neon serverless adapter: `@neondatabase/serverless`
- Initialize DB inside each function, not globally

### Issue 3: "API routes return 404"
**Solution:**
- Check `vercel.json` rewrites configuration
- Ensure API files export `default async function handler(req, res)`
- Verify file paths match URL structure

### Issue 4: "CORS errors on API calls"
**Solution:** Add CORS headers in `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

### Issue 5: "Environment variables undefined"
**Solution:**
- Set variables in Vercel Dashboard (Project Settings → Environment Variables)
- Redeploy after adding variables
- Use `process.env.VARIABLE_NAME` in API functions

### Issue 6: "Payment processing fails"
**Solution:**
- Ensure Stripe secret key is in Vercel env vars
- Initialize Stripe per request: `new Stripe(process.env.STRIPE_SECRET_KEY)`
- Check webhook endpoints are configured correctly

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Convert all Express routes to `/api` functions
- [ ] Move `postcss.config.js` and `tailwind.config.ts` to `client/`
- [ ] Update `client/package.json` with all dependencies
- [ ] Create `vercel.json` with correct configuration
- [ ] Test all API endpoints locally
- [ ] Verify database schema is up to date

### Vercel Setup
- [ ] Import GitHub repository to Vercel
- [ ] Set Framework Preset to "Vite" or "Other"
- [ ] Configure Root Directory (leave as `.` for monorepo)
- [ ] Set Build Command: `npm run build --prefix client`
- [ ] Set Output Directory: `client/dist`
- [ ] Add all environment variables:
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] Any other required variables

### Post-Deployment
- [ ] Test all pages load correctly
- [ ] Verify API endpoints work
- [ ] Test authentication (login/signup)
- [ ] Test product listing and detail pages
- [ ] Test cart functionality
- [ ] Test checkout process
- [ ] Verify admin dashboard (if applicable)
- [ ] Check Vercel logs for errors
- [ ] Monitor performance metrics

### Optional Enhancements
- [ ] Add Vercel Analytics
- [ ] Add Vercel Speed Insights
- [ ] Set up custom domain
- [ ] Configure caching headers
- [ ] Add rate limiting (via Upstash or Vercel Edge Config)

---

## 📊 Key Conversion Patterns Summary

### Express → Vercel Mapping

| Express Pattern | Vercel Pattern |
|----------------|---------------|
| `app.get('/api/products')` | `api/products/index.js` → `export default handler` |
| `app.get('/api/products/:id')` | `api/products/[id].js` → `const { id } = req.query` |
| `app.post('/api/cart/add')` | `api/cart/add.js` → `const data = req.body` |
| Database connection pool | Initialize per request with Neon |
| Session middleware | JWT tokens in headers |
| `res.json(data)` | `res.status(200).json(data)` |

### Critical Rules

1. **Always initialize database per request** - No shared connections
2. **Always validate req.method** - Each function handles its own methods
3. **Always use environment variables** - Never hardcode secrets
4. **Always handle errors** - Wrap in try/catch, return proper status codes
5. **Always return response** - Every code path must call `res.status().json()`

---

## 🎯 Final Notes

- **Frontend stays the same** - Only API/backend changes
- **Same functionality** - Users won't notice any difference
- **Better performance** - Vercel's CDN and edge network
- **Auto-scaling** - Handles traffic spikes automatically
- **Lower costs** - Pay per request, not per server hour

**Good luck with your deployment! 🚀**

---

*Last updated: Based on successful Somnia Faucet Vercel conversion*
