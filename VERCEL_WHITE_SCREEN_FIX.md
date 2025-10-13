# 🔧 Fix White Screen on Vercel - Environment Variables Missing

## ❌ Problem
Your Vercel deployment shows a **white screen** because the frontend is missing required environment variables.

## ✅ Solution

### Step 1: Add Environment Variables to Vercel

Go to your **Vercel Dashboard**:
1. Navigate to: **Your Project → Settings → Environment Variables**
2. Add the following variables:

#### Required Frontend Variables (VITE_ prefix):
```
VITE_SUPABASE_URL = <your-supabase-project-url>
VITE_SUPABASE_ANON_KEY = <your-supabase-anon-key>
```

#### Required Backend Variables (no prefix):
```
DATABASE_URL = <your-postgres-connection-string>
SUPABASE_URL = <your-supabase-project-url>
SUPABASE_ANON_KEY = <your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY = <your-supabase-service-role-key>
```

#### Optional Variables:
```
VITE_PAYSTACK_PUBLIC_KEY = <your-paystack-public-key>
PAYSTACK_SECRET_KEY = <your-paystack-secret-key>
ADMIN_API_KEY = <your-admin-api-key>
```

---

### Step 2: Where to Find These Values

#### Supabase Variables:
1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on **Settings** → **API**
3. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - **anon/public key** → Use for `VITE_SUPABASE_ANON_KEY` and `SUPABASE_ANON_KEY`
   - **service_role key** → Use for `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

#### Database URL:
- If using **Supabase**: Settings → Database → Connection String
- If using **Neon**: Copy from Neon dashboard
- If using **Vercel Postgres**: Auto-configured

#### Paystack Keys (Optional):
- Login to Paystack Dashboard
- Go to Settings → API Keys & Webhooks
- Copy **Public Key** and **Secret Key**

---

### Step 3: Redeploy

**IMPORTANT:** Environment variables only apply to NEW deployments!

After adding variables:

#### Option A: Trigger Redeploy via Git
```bash
git commit --allow-empty -m "Trigger redeploy with env vars"
git push
```

#### Option B: Redeploy via Vercel Dashboard
1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**

---

## 🧪 Verify the Fix

After redeployment:

### 1. Check Frontend (Should load properly)
```
https://your-app.vercel.app/
```
✅ Should show your app (not white screen)

### 2. Check Backend API
```
https://your-app.vercel.app/api/health
```
✅ Should return JSON health status

### 3. Check Browser Console
- Press F12 → Console tab
- Should see no errors about missing environment variables

---

## 📋 Quick Checklist

- [ ] Added `VITE_SUPABASE_URL` to Vercel
- [ ] Added `VITE_SUPABASE_ANON_KEY` to Vercel
- [ ] Added `SUPABASE_URL` to Vercel (backend)
- [ ] Added `SUPABASE_ANON_KEY` to Vercel (backend)
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` to Vercel (backend)
- [ ] Added `DATABASE_URL` to Vercel
- [ ] Triggered a new deployment
- [ ] Verified site loads correctly

---

## 🔍 Understanding the Issue

### Why the White Screen?

Your React app imports `client/src/lib/supabase.ts` which requires:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Before the fix:** The code threw an error at import time, preventing React from mounting → White screen

**After the fix:** 
1. The code now handles missing variables gracefully
2. Shows a helpful error banner if variables are still missing
3. App loads and displays configuration instructions

### Why VITE_ Prefix?

Vite only exposes environment variables prefixed with `VITE_` to the frontend for security. Backend variables (without prefix) are only available server-side.

**Frontend needs:**
- `VITE_SUPABASE_URL` (exposed to browser)
- `VITE_SUPABASE_ANON_KEY` (exposed to browser - safe to expose)

**Backend needs:**
- `SUPABASE_URL` (server-side only)
- `SUPABASE_ANON_KEY` (server-side only)
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only - NEVER expose to frontend!)

---

## 🚀 Next Steps

1. **Add the environment variables to Vercel** (see Step 1 above)
2. **Trigger a redeploy** (see Step 3 above)
3. **Verify the site loads** (see Verify section above)
4. Your app should now work correctly! 🎉

---

## ❓ Still Having Issues?

If you still see a white screen after adding env vars and redeploying:

1. **Check Browser Console** (F12 → Console) for errors
2. **Check Vercel Function Logs** (Vercel Dashboard → Deployments → View Function Logs)
3. **Visit diagnostic page**: `https://your-app.vercel.app/api-diagnostic`
4. **Verify all env vars are set**: Vercel Dashboard → Settings → Environment Variables

---

## 📝 Summary

The white screen was caused by **missing VITE_ prefixed environment variables** for the frontend. The code has been updated to:

✅ Handle missing variables gracefully (no more white screen)  
✅ Show helpful error message when variables are missing  
✅ Provide clear instructions on what to configure  

**Action Required:** Add the environment variables to Vercel and redeploy.
