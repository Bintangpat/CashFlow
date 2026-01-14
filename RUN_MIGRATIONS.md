# 🚀 Run Migrations - 2 Methods (IPv6 Network Issue Workaround)

## Problem
`railway run` doesn't work from your local machine because of network/IPv6 issues connecting to Supabase.

---

## ✅ RECOMMENDED: Method 1 - Railway Build Command

This runs migrations **inside Railway environment** (not from your laptop).

### Step-by-Step:

1. **Go to Railway Dashboard**
   - Login to Railway
   - Select your API service
   - Go to **Settings** → **Deploy**

2. **Update Build Command (Temporarily)**
   
   Find "Build Command" field and change it to:
   ```bash
   pnpm install --frozen-lockfile && pnpm --filter @cashflow/api db:migrate:deploy && pnpm --filter @cashflow/api build
   ```

3. **Save and Redeploy**
   - Click **Save**
   - Go to **Deployments** tab
   - Click **Redeploy** button

4. **Watch the Logs**
   
   You'll see migrations running:
   ```
   Applying migration `20260113023843_init`
   Applying migration `20260113034629_add_otp`
   Applying migration `20260113041116_add_stock_receiving`
   ✅ Migrations applied successfully
   ```

5. **IMPORTANT: Restore Build Command**
   
   After successful deployment, go back to Settings → Deploy and change build command back to:
   ```bash
   pnpm install --frozen-lockfile && pnpm --filter @cashflow/api build
   ```
   
   **Why?** You don't want migrations running on every deploy - only when needed.

6. **Update CORS_ORIGINS**
   
   While you're in Railway, also update **Variables**:
   ```env
   CORS_ORIGINS=https://cash-flow-two-iota.vercel.app
   ```

---

## 🔧 Method 2 - Manual SQL via Supabase Dashboard

If Method 1 doesn't work, run SQL directly in Supabase.

### Step-by-Step:

1. **Login to Supabase**
   - Go to [supabase.com](https://supabase.com)
   - Login and select your project

2. **Open SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click "+ New query"

3. **Copy the Migration SQL**
   
   Open this file in your project:
   ```
   apps/api/prisma/migrations/MANUAL_MIGRATION_SUPABASE.sql
   ```

4. **Paste and Run**
   - Copy ALL content from the file
   - Paste into Supabase SQL Editor
   - Click **Run** or press `Ctrl+Enter`

5. **Verify Success**
   
   You should see:
   ```
   Success. No rows returned
   ```

6. **Check Tables Created**
   
   Go to **Table Editor** in Supabase. You should see:
   - users
   - products
   - sales
   - sale_items
   - cash_transactions
   - otp_tokens
   - stock_receivings
   - _prisma_migrations

---

## ✅ Verify Everything Works

### 1. Check Railway Logs
Railway deployment should show:
```
🚀 Server running on port 3001
📍 Environment: production
🌐 CORS allowed origins: [ 'https://cash-flow-two-iota.vercel.app' ]
```

### 2. Test Login on Vercel
1. Go to: https://cash-flow-two-iota.vercel.app
2. Try to register/login
3. Should work! 🎉

### 3. No More Database Errors
Railway logs should NOT show:
```
❌ Can't reach database server
❌ Table doesn't exist
```

---

## Which Method Should I Use?

### Use Method 1 (Railway Build Command) if:
- ✅ You want Railway to handle everything
- ✅ You want to avoid manual SQL
- ✅ Easiest and recommended!

### Use Method 2 (Manual SQL) if:
- ✅ Method 1 didn't work
- ✅ You want direct control
- ✅ You prefer GUI interface

---

## After Migrations Complete

Remember to:
1. ✅ Restore Railway build command to normal
2. ✅ Update CORS_ORIGINS in Railway variables
3. ✅ Test your Vercel app

---

## Troubleshooting

### "Relation already exists"
**Cause**: Tables already created
**Solution**: Migrations already done! Skip to verification.

### "Permission denied"
**Cause**: Supabase user doesn't have CREATE permissions
**Solution**: Use Supabase SQL Editor (not external SQL client)

### Build still failing after migrations
**Cause**: Build command not restored
**Solution**: Remove `db:migrate:deploy` from build command

---

**After completing either method, your app should be fully functional!** 🚀
