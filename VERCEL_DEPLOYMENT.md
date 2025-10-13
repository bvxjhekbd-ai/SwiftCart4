# Vercel Deployment Guide

## Overview
This project is now configured for deployment on Vercel. The setup includes a serverless API handler and optimized build configuration.

## Pre-Deployment Checklist

### 1. Environment Variables
Before deploying, ensure you have the following environment variables ready:

- `DATABASE_URL` - PostgreSQL database connection string (use Neon or another serverless-compatible database)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `PAYSTACK_SECRET_KEY` - Your Paystack secret key for payment processing
- `ADMIN_API_KEY` - (Optional) API key for admin product posting
- `NODE_ENV` - Set to `production` for production deployment

### 2. Database Setup
Ensure your database is accessible from Vercel. We recommend using:
- **Neon** (PostgreSQL) - Serverless-compatible, works great with Vercel
- **Supabase** (PostgreSQL) - Already integrated for auth

## Deployment Steps

### Step 1: Push to GitHub
1. Create a GitHub repository (if not already done)
2. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Prepare for Vercel deployment"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### Step 2: Import to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`

### Step 3: Configure Environment Variables
In the Vercel project settings:
1. Go to "Settings" → "Environment Variables"
2. Add all the environment variables listed above
3. Make sure to add them for:
   - Production
   - Preview (optional)
   - Development (optional)

### Step 4: Deploy
1. Click "Deploy"
2. Vercel will:
   - Install dependencies
   - Build the Vite frontend
   - Set up the serverless API functions
   - Deploy to a `.vercel.app` domain

### Step 5: Verify Deployment
After deployment:
1. Check the deployment logs for any errors
2. Visit your site at `https://your-project.vercel.app`
3. Test the following:
   - Landing page loads
   - User authentication (signup/login)
   - Product listings
   - API endpoints
   - Admin dashboard (if admin user)

## Project Structure for Vercel

```
project/
├── api/                    # Serverless functions
│   └── [...route].ts      # Catch-all API handler
├── client/                # React frontend
│   └── src/
├── server/                # Backend logic
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── supabaseAuth.ts   # Authentication
├── shared/               # Shared types/schemas
├── dist/                 # Build output (generated)
│   └── public/          # Frontend build
├── vercel.json          # Vercel configuration
├── .vercelignore        # Files to exclude
└── package.json         # Dependencies
```

## How It Works

### API Handling
- All `/api/*` requests are routed to `api/[...route].ts`
- This file creates an Express app and registers all routes from `server/routes.ts`
- Serverless functions are stateless, so connections are created per request

### Frontend Serving
- Vite builds the frontend to `dist/public/`
- Vercel serves these static files
- All non-API routes serve `index.html` for client-side routing

### Authentication
- Uses Supabase Auth for user authentication
- Session management via Supabase client
- Admin users can access admin dashboard

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation succeeds locally

### API Errors
- Check environment variables are set correctly
- Verify database connection string is valid
- Check Vercel function logs for errors

### CORS Issues
- The project is configured to handle CORS automatically
- If you need specific origins, update `vercel.json` headers section

### Database Connection Issues
- Use a serverless-compatible database (Neon, Supabase, etc.)
- Traditional connection pooling may not work with serverless
- Ensure `@neondatabase/serverless` is in dependencies

## Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions
4. Update environment variables if needed

## Monitoring & Analytics
- Use Vercel Analytics (free tier available)
- Check function logs in Vercel dashboard
- Set up error tracking (e.g., Sentry) for production

## Rolling Back
If deployment has issues:
1. Go to Deployments in Vercel dashboard
2. Find a previous working deployment
3. Click "..." → "Promote to Production"

## Cost Considerations
- Vercel Free Tier includes:
  - 100GB bandwidth
  - Serverless function execution
  - Automatic HTTPS
- Monitor usage in dashboard
- Upgrade to Pro if needed

## Support
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Project Issues: Create issue in GitHub repo
