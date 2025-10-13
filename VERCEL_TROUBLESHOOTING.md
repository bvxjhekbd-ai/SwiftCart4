# Vercel Deployment Troubleshooting Guide

## 🔍 Quick Diagnostic Tool

**First Step: Check if your API is working**

Visit: `https://your-app.vercel.app/api-diagnostic`

This diagnostic page will show you:
- ✅ If the API is accessible
- ✅ Which environment variables are configured
- ✅ If authentication endpoints are working

## Common Issue: Login Works But Immediately Logs Out

### Symptoms
- Login shows "Successfully logged in" message
- Immediately redirected back to login page
- No errors in browser console
- No logs in Vercel Functions

### Root Cause
Your **backend API is not accessible** or **environment variables are missing**.

### Solution Steps

#### 1. Verify API Deployment

Visit: `https://your-app.vercel.app/api/health`

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "databaseConfigured": true,
  "supabaseConfigured": true,
  "supabaseServiceRoleConfigured": true
}
```

**If you get a 404 or error:**
- Your serverless function didn't deploy
- Check the "Functions" tab in Vercel dashboard
- Look for `api/[...route].func` or `api/[...route].ts`

#### 2. Check Environment Variables

Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

**Required Variables:**
- ✅ `SUPABASE_URL` - Your Supabase project URL
- ✅ `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - **CRITICAL** - Service role key (this is often missing!)
- ✅ `DATABASE_URL` - PostgreSQL connection string

**How to find these:**

1. **Supabase Variables:**
   - Go to your Supabase project
   - Settings → API
   - Copy: Project URL, anon key, and **service_role key**

2. **Database URL:**
   - If using Supabase: Settings → Database → Connection string
   - If using Neon: Copy from Neon dashboard
   - If using Vercel Postgres: Auto-configured

#### 3. Redeploy After Adding Variables

**IMPORTANT:** Environment variables are only applied to NEW deployments!

After adding variables:
```bash
# Trigger a new deployment
git commit --allow-empty -m "Redeploy with env vars"
git push
```

Or in Vercel Dashboard:
- Go to Deployments tab
- Click "..." on latest deployment
- Click "Redeploy"

## Issue: API Returns 404

### Check 1: Verify File Structure

Your deployed project should have:
```
api/
  └── [...route].ts   ← This file must exist!
```

**How to check:**
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on your latest deployment
3. Click "Source" tab
4. Navigate to `api` folder
5. Verify `[...route].ts` exists

**If missing:**
- Check your `.gitignore` - make sure `api/` isn't excluded
- Check `.vercelignore` - make sure `api/` isn't excluded
- Commit and push the `api/` folder

### Check 2: Build Logs

1. Go to Vercel Dashboard → Deployments
2. Click on your deployment
3. Click "Building" tab
4. Look for errors related to TypeScript compilation

**Common build errors:**
- Missing dependencies: Run `npm install` locally first
- TypeScript errors: Run `npm run check` locally to find issues

## Issue: Database Connection Errors

### Symptoms
- API works but database queries fail
- Error: "Database connection failed"
- Logs show connection timeout

### Solutions

#### For Neon Database:
```env
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```
- Ensure `?sslmode=require` is at the end
- Verify Neon allows connections from Vercel's IPs (usually auto-configured)

#### For Supabase Database:
```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```
- Use the "Connection Pooling" connection string (port 6543, not 5432)
- This is required for serverless environments

#### For Vercel Postgres:
- Should auto-configure
- Check "Storage" tab in Vercel dashboard
- Ensure database is linked to your project

## Issue: Supabase Auth Not Working

### Check 1: Supabase URL Configuration

In Supabase Dashboard → Authentication → URL Configuration:

**Site URL:** `https://your-app.vercel.app`

**Redirect URLs (add all these):**
```
https://your-app.vercel.app
https://your-app.vercel.app/auth
https://your-app.vercel.app/*
https://*.vercel.app/*  (for preview deployments)
```

### Check 2: Email Template Links

If using email confirmation:
- Go to Supabase → Authentication → Email Templates
- Ensure links use `{{ .SiteURL }}` not hardcoded URLs

## Checking Vercel Function Logs

### Real-time Logs

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. View logs:
```bash
vercel logs your-project-name --follow
```

### Dashboard Logs

1. Go to Vercel Dashboard → Your Project
2. Click "Logs" tab (or "Functions" → Select function → "Logs")
3. Look for errors in your API routes

**Common log errors:**
- "Module not found" → Missing dependency
- "Cannot find module '../server/routes'" → Build issue
- "Invalid credentials" → Supabase service role key missing
- Database connection errors → DATABASE_URL wrong

## Testing Your Deployment

### Test API Health
```bash
curl https://your-app.vercel.app/api/health
```

### Test Auth Endpoint
```bash
curl https://your-app.vercel.app/api/auth/user
# Should return: {"message":"No token provided"} (this is correct!)
```

### Test Products Endpoint
```bash
curl https://your-app.vercel.app/api/products
# Should return: [] or a list of products
```

## Still Having Issues?

### 1. Use the Diagnostic Tool
Visit: `https://your-app.vercel.app/api-diagnostic`

### 2. Check Vercel Status
Visit: https://www.vercel-status.com/

### 3. Compare with Working Deployment

If it works on Replit but not Vercel:
- Environment variables are different
- Database connection string might need adjustment
- Check if you're using Replit-specific features

### 4. Enable Debug Mode

Add to Vercel environment variables:
```
NODE_ENV=production
DEBUG=*
```

Then check logs for detailed output.

## Deployment Checklist

Before asking for help, verify:

- [ ] `/api/health` endpoint returns 200 OK
- [ ] All 4 required environment variables are set in Vercel
- [ ] You've redeployed AFTER adding environment variables
- [ ] Supabase redirect URLs include your Vercel domain
- [ ] `api/[...route].ts` file exists in deployment
- [ ] Build completed without errors (check Build logs)
- [ ] Database connection string is correct for serverless (pooling enabled)
- [ ] You're testing on the production deployment (not a preview)

## Quick Fixes Summary

| Issue | Solution |
|-------|----------|
| Login loops | Add `SUPABASE_SERVICE_ROLE_KEY` and redeploy |
| API 404 | Verify `api/[...route].ts` exists, check `.vercelignore` |
| Database errors | Use pooled connection string |
| Build fails | Run `npm run check` locally, fix TypeScript errors |
| No logs | API isn't being called - check `/api/health` |
| CORS errors | Update Supabase redirect URLs |

## Need More Help?

1. Share the output from `/api-diagnostic`
2. Share Vercel Function logs
3. Share any error messages from browser console
4. Confirm which environment variables are set (don't share the actual values!)
