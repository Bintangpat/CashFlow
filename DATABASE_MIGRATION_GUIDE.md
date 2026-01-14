# 🗄️ Database Migration Guide for Railway/Supabase

## Problem
Your database connection works, but tables don't exist because migrations haven't been run in production.

**Error you saw:**
```
Can't reach database server / No table found
```

This means the Prisma schema hasn't been applied to your production database yet.

---

## Solution: Run Migrations on Railway

### Method 1: Using Railway CLI (Recommended)

#### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

#### 2. Login to Railway
```bash
railway login
```
This will open a browser window to authenticate.

#### 3. Link to Your Project
```bash
cd d:\Projects\CashFlow
railway link
```
Select your project from the list.

#### 4. Run Migrations
```bash
railway run pnpm --filter @cashflow/api db:migrate:deploy
```

This will:
- ✅ Apply all pending migrations to production database
- ✅ Create all necessary tables
- ✅ Set up database schema

#### 5. Verify
Check Railway logs - you should see:
```
Applying migration `20260113023843_init`
Applying migration `20260113034629_add_otp`
Applying migration `20260113041116_add_stock_receiving`
Database migrations completed successfully
```

---

### Method 2: One-Time Build Command

If you don't want to install Railway CLI:

#### 1. Go to Railway Dashboard
1. Open your API service
2. Go to **Settings** → **Deploy**
3. Find **Build Command**

#### 2. Temporarily Add Migration
Change build command to:
```bash
pnpm install --frozen-lockfile && pnpm --filter @cashflow/api prisma migrate deploy && pnpm --filter @cashflow/api build
```

#### 3. Trigger Redeploy
1. Go to **Deployments** tab
2. Click **Deploy** or push a new commit
3. Watch the build logs

#### 4. Restore Build Command (IMPORTANT!)
After successful migration, change build command back to:
```bash
pnpm install --frozen-lockfile && pnpm --filter @cashflow/api build
```

**Why?** You don't want to run migrations on every deploy - only when schema changes.

---

### Method 3: Manual SQL (If Railway CLI doesn't work)

#### 1. Get Migration SQL Files
Migrations are in: `apps/api/prisma/migrations/`

You have 3 migrations:
1. `20260113023843_init/migration.sql`
2. `20260113034629_add_otp/migration.sql`
3. `20260113041116_add_stock_receiving/migration.sql`

#### 2. Access Railway/Supabase Database
- **Railway**: Dashboard → PostgreSQL service → Query tab
- **Supabase**: Dashboard → SQL Editor

#### 3. Run Each Migration SQL
Copy and paste the content of each `migration.sql` file **in order**:

1. First: `20260113023843_init/migration.sql`
2. Second: `20260113034629_add_otp/migration.sql`
3. Third: `20260113041116_add_stock_receiving/migration.sql`

#### 4. Create Prisma Migrations Table
After running migrations, create the tracking table:
```sql
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  id VARCHAR(36) PRIMARY KEY,
  checksum VARCHAR(64) NOT NULL,
  finished_at TIMESTAMP WITH TIME ZONE,
  migration_name VARCHAR(255) NOT NULL,
  logs TEXT,
  rolled_back_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  applied_steps_count INTEGER NOT NULL DEFAULT 0
);

-- Insert migration records
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, started_at, applied_steps_count)
VALUES 
  (gen_random_uuid(), '', now(), '20260113023843_init', now(), 1),
  (gen_random_uuid(), '', now(), '20260113034629_add_otp', now(), 1),
  (gen_random_uuid(), '', now(), '20260113041116_add_stock_receiving', now(), 1);
```

---

## For Future Migrations

### When You Change Your Schema Locally

#### 1. Create Migration Locally
```bash
pnpm --filter @cashflow/api db:migrate
# This creates a new migration file
```

#### 2. Test Locally
Make sure your app works with the new schema.

#### 3. Commit and Push
```bash
git add .
git commit -m "feat: add new schema changes"
git push
```

#### 4. Deploy to Production
```bash
# Using Railway CLI
railway run pnpm --filter @cashflow/api db:migrate:deploy
```

---

## Available Database Commands

From project root, you can run:

```bash
# Development - Create new migration
pnpm --filter @cashflow/api db:migrate

# Production - Apply pending migrations
pnpm --filter @cashflow/api db:migrate:deploy

# Generate Prisma Client
pnpm --filter @cashflow/api db:generate

# Open Prisma Studio (Database GUI)
pnpm --filter @cashflow/api db:studio

# Push schema without migration (dev only!)
pnpm --filter @cashflow/api db:push
```

---

## Verification Checklist

After running migrations, verify:

### 1. Railway Logs Show Success
```
✅ Migrations applied successfully
```

### 2. Try Login Again
Visit your Vercel app and try to login. Should work now!

### 3. Check Database Tables
Using Railway Query tab or Supabase SQL Editor:
```sql
-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Should show:
-- User
-- AuthOtpToken
-- Stock
-- StockMovement
-- StockReceiving
-- _prisma_migrations
```

### 4. Test API Endpoints
```bash
# Health check
curl https://your-railway-url.up.railway.app/

# Should return 200 OK
```

---

## Troubleshooting

### "Migration already applied"
**Solution**: Migrations are already in database. No action needed!

### "Database is locked"
**Solution**: 
1. Stop all running instances
2. Wait 30 seconds
3. Try again

### "Connection timeout"
**Solution**:
1. Check `DATABASE_URL` in Railway is correct
2. Verify PostgreSQL service is running
3. Check if IP is whitelisted (Supabase requires this)

### "Table already exists"
**Solution**: Your database has the tables but Prisma doesn't know about them.

Run this to sync:
```bash
railway run pnpm --filter @cashflow/api prisma db pull
railway run pnpm --filter @cashflow/api prisma generate
```

---

## Best Practices

1. ✅ **Always use `migrate deploy` in production** - Never use `migrate dev`
2. ✅ **Test migrations locally first** - Don't test on production
3. ✅ **Backup database before major migrations** - Railway/Supabase have backup features
4. ✅ **Run migrations during low-traffic periods** - Avoid downtime
5. ✅ **Version control your migrations** - Already done with Git!

---

## Quick Command Reference

```bash
# Setup Railway CLI (one time)
npm install -g @railway/cli
railway login
cd d:\Projects\CashFlow
railway link

# Run migrations (every schema change)
railway run pnpm --filter @cashflow/api db:migrate:deploy

# Check database
railway run pnpm --filter @cashflow/api db:studio
```

---

## Next Steps

1. ✅ Run migrations using Method 1 (Railway CLI)
2. ✅ Verify tables exist in Railway/Supabase dashboard
3. ✅ Test login on your Vercel app
4. ✅ Check Railway logs for any errors

**After migrations complete, your app should work perfectly!** 🎉
