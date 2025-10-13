# Vercel Deployment Checklist ✅

## Your Setup is Already Correct!

Your current Vercel configuration is optimal and follows modern best practices. **DO NOT** change `vercel.json` or `server/index.ts` as suggested.

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### 2. Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect the configuration from `vercel.json`

### 3. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

#### Required Variables (Backend will NOT work without these):
```
DATABASE_URL=your_postgresql_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Optional Variables:
```
ADMIN_API_KEY=your_admin_api_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
NODE_ENV=production
```

**CRITICAL:** For Supabase database, use the **pooled connection string**:
```
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```
Note the port `6543` and `?pgbouncer=true` - this is required for serverless!

### 4. Deploy
Click "Deploy" in Vercel dashboard

### 5. Verify Deployment

After deployment, test these endpoints:

1. **Frontend:** `https://your-app.vercel.app/` ✅
2. **Backend Health:** `https://your-app.vercel.app/api/health` ✅
3. **API Diagnostic:** `https://your-app.vercel.app/api-diagnostic` ✅

Expected response from `/api/health`:
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

### 6. Update Supabase Settings

In Supabase Dashboard → Authentication → URL Configuration:

**Site URL:** `https://your-app.vercel.app`

**Redirect URLs:**
```
https://your-app.vercel.app
https://your-app.vercel.app/auth
https://your-app.vercel.app/*
https://*.vercel.app/*
```

## Why Your Current Setup is Better

### ❌ Don't Use This (Legacy):
```json
{
  "builds": [
    { "src": "server/index.ts", "use": "@vercel/node" }
  ],
  "routes": [...]
}
```

### ✅ Use This (Current - Modern):
```json
{
  "rewrites": [...],
  "functions": {
    "api/[...route].ts": { "maxDuration": 30 }
  }
}
```

**Advantages of your current setup:**
- Uses modern `rewrites` instead of deprecated `routes`
- Serverless function in `api/[...route].ts` is cleaner
- No need to modify `server/index.ts`
- Follows Vercel 2025 best practices
- Automatic function detection

## Troubleshooting

### If Backend Doesn't Work:

1. **Check Environment Variables**
   - Go to Vercel → Settings → Environment Variables
   - Verify all required variables are set
   - **Redeploy after adding variables!**

2. **Check Function Deployment**
   - Go to Vercel → Functions tab
   - Look for `api/[...route].func`
   - Check logs for errors

3. **Use Diagnostic Tool**
   - Visit: `https://your-app.vercel.app/api-diagnostic`
   - Shows which env vars are configured

### Common Issues:

| Issue | Solution |
|-------|----------|
| Login loops | Missing `SUPABASE_SERVICE_ROLE_KEY` |
| Database errors | Use pooled connection string with port 6543 |
| API 404 | Verify `api/[...route].ts` exists in deployment |
| Build fails | Run `npm run check` locally first |

## Your Configuration is Production-Ready! 🚀

No changes needed to `vercel.json` or `server/index.ts`. Just:
1. Set environment variables in Vercel
2. Deploy
3. Update Supabase redirect URLs
4. Test the endpoints

See `VERCEL_DEPLOYMENT.md` and `VERCEL_TROUBLESHOOTING.md` for more details.
