# Vercel Deployment Guide

This guide explains how to deploy this full-stack application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Vercel CLI installed (optional): `npm i -g vercel`
3. A PostgreSQL database (e.g., Neon, Supabase, or Vercel Postgres)
4. Supabase project setup for authentication

## Project Structure

This is a monorepo containing:
- **Frontend**: React + Vite application (builds to `dist/public`)
- **Backend**: Express.js API (serverless functions in `api/` folder)
- **Database**: PostgreSQL with Drizzle ORM

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Configure Environment Variables**
   
   In the Vercel dashboard, add these environment variables:

   **Required:**
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

   **Optional:**
   - `ADMIN_API_KEY` - For legacy admin API endpoint
   - `PAYSTACK_SECRET_KEY` - For payment processing
   - `NODE_ENV` - Set to "production"

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - You'll get a production URL like `your-app.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Preview**
   ```bash
   vercel
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

5. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

## Database Setup

### Option 1: Neon (Recommended)

1. Create a Neon database at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Add it to Vercel environment variables as `DATABASE_URL`

### Option 2: Vercel Postgres

1. In your Vercel project, go to "Storage"
2. Click "Create Database" → "Postgres"
3. The `DATABASE_URL` will be automatically added to your environment variables

### Option 3: Supabase Postgres

1. Use your existing Supabase project's database
2. Get the connection string from Supabase settings
3. Add it as `DATABASE_URL` in Vercel

### Run Database Migrations

After deployment, run migrations:

```bash
# Using Vercel CLI
vercel env pull .env.production
npm run db:push
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `ADMIN_API_KEY` | No | Legacy admin API endpoint key |
| `PAYSTACK_SECRET_KEY` | No | Paystack payment integration key |
| `NODE_ENV` | No | Set to "production" for production builds |

## Build Configuration

The project uses `vercel.json` for configuration:

- **Build Command**: `vite build` - Builds the React frontend
- **Output Directory**: `dist/public` - Static files are served from here
- **API Routes**: Serverless functions in `/api` folder using catch-all pattern `[...route].ts`
- **Routing**: 
  - `/api/*` requests → Automatically routed to `api/[...route].ts` serverless function
  - All other requests → Rewritten to `/index.html` for SPA routing

**Important:** The serverless handler in `api/[...route].ts` prepends `/api` to the URL before passing to Express, because Vercel strips this prefix from catch-all routes. This ensures Express routes mounted under `/api/*` in `server/routes.ts` match correctly.

## Important Notes

### Serverless Limitations

- **No persistent connections**: Each API request runs in a new serverless function
- **Timeout**: 30 seconds max per request (configurable in `vercel.json`)
- **Cold starts**: First request may be slower
- **No WebSockets**: Use alternatives like Pusher or Ably if needed

### Database Connection Pooling

Use connection pooling for serverless:

```typescript
// The project already uses @neondatabase/serverless
// which has built-in connection pooling
```

### Session Management

The current session setup uses `express-session` with PostgreSQL storage, which works with serverless but may have cold start issues. Consider:

- Using Supabase Auth sessions (already implemented)
- JWT tokens
- Vercel KV for session storage

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify TypeScript compiles: `npm run check`

### API Routes Return 404

- Ensure `vercel.json` rewrites are correct
- Check that API routes start with `/api`
- Verify the serverless function exports correctly

### Database Connection Errors

- Verify `DATABASE_URL` is set correctly
- Ensure database accepts connections from Vercel IPs
- Check if connection pooling is enabled

### CORS Errors

- The API should already handle CORS for Supabase Auth
- If needed, add more origins in `server/supabaseAuth.ts`

## Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Admin user created (check admin email in `server/supabaseAuth.ts`)
- [ ] Payment integration tested (Paystack)
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Custom domain configured (optional)
- [ ] Error logging setup (Vercel automatically logs errors)

## Automatic Deployments

Once connected to GitHub:

- **Push to main branch** → Automatic production deployment
- **Push to other branches** → Automatic preview deployment
- **Pull requests** → Automatic preview deployment with unique URL

## Rollback

To rollback to a previous deployment:

1. Go to Vercel dashboard → Deployments
2. Find the previous successful deployment
3. Click "Promote to Production"

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions
- Project Issues: Check your repository's issue tracker
