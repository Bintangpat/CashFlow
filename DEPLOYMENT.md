# 🚀 CashFlow Deployment Guide

## Overview
- **Backend**: Railway (Express API)
- **Frontend**: Vercel (Next.js)
- **Database**: Railway PostgreSQL

---

## 📦 Backend Deployment (Railway)

### 1. Setup Railway Project

1. **Connect GitHub Repository**
   - Go to [Railway.app](https://railway.app)
   - Create new project → Deploy from GitHub repo
   - Select `Bintangpat/CashFlow` repository

2. **Add PostgreSQL Database**
   - In your Railway project, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically create `DATABASE_URL` variable

### 2. Configure Environment Variables

Go to your Railway service → **Variables** tab and add:

```env
# Node Environment
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your-super-secret-production-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=CashFlow <noreply@yourdomain.com>

# Frontend URL (Your Vercel deployment URL)
FRONTEND_URL=https://your-app.vercel.app

# Database (automatically set by Railway PostgreSQL)
DATABASE_URL=postgresql://...
```

> ⚠️ **Important**: Replace `FRONTEND_URL` with your actual Vercel deployment URL!

### 3. Deploy Configuration

The project includes `nixpacks.toml` and `railway.json` which automatically configure:
- ✅ Install dependencies with `pnpm install --frozen-lockfile`
- ✅ Build API with `pnpm --filter @cashflow/api build`
- ✅ Start server with `pnpm --filter @cashflow/api start`
- ✅ Auto-generate Prisma client via postinstall hook

### 4. Run Database Migrations

After first deployment, you need to run migrations:

**Option A: Using Railway CLI**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run migrations
railway run pnpm --filter @cashflow/api prisma migrate deploy
```

**Option B: Using Railway Dashboard**
1. Go to your service → **Deployments** tab
2. Click on latest deployment → **View Logs**
3. Verify Prisma generates successfully
4. You may need to add migration command to build process temporarily

### 5. Get Your Railway API URL

After successful deployment, Railway will provide a URL like:
```
https://your-service-name.up.railway.app
```

Copy this URL - you'll need it for frontend configuration!

---

## 🌐 Frontend Deployment (Vercel)

### 1. Setup Vercel Project

1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. **Root Directory**: Set to `apps/web`
4. **Framework Preset**: Next.js

### 2. Configure Environment Variables

In Vercel project → **Settings** → **Environment Variables**, add:

```env
# Backend API URL (from Railway)
NEXT_PUBLIC_API_URL=https://your-service-name.up.railway.app/api

# NextAuth Configuration
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars

# Add any other frontend-specific variables
```

> 📝 **Note**: Replace `your-service-name.up.railway.app` with your Railway deployment URL

### 3. Deploy

Click **Deploy** - Vercel will:
- ✅ Install dependencies
- ✅ Build Next.js application
- ✅ Deploy to CDN

---

## 🔄 Update Railway with Vercel URL

After Vercel deployment completes:

1. **Copy your Vercel URL**: `https://your-app.vercel.app`
2. **Update Railway Environment Variables**:
   - Go to Railway → Variables
   - Update `FRONTEND_URL` to your Vercel URL
   - Railway will auto-redeploy with new CORS configuration

---

## ✅ Verification Checklist

### Backend Health Check
- [ ] Railway deployment successful
- [ ] Database connected (check logs for "🚀 Server running")
- [ ] Migrations applied successfully
- [ ] API endpoint accessible (visit `https://your-railway-url.up.railway.app/api`)

### Frontend Health Check
- [ ] Vercel deployment successful
- [ ] Can access homepage
- [ ] Environment variables loaded correctly
- [ ] No CORS errors in browser console

### Integration Testing
- [ ] Registration flow works
- [ ] OTP email received successfully
- [ ] Login flow works
- [ ] Authenticated API calls succeed
- [ ] No CORS errors

---

## 🐛 Troubleshooting

### CORS Errors
**Problem**: `Access to fetch at '...' has been blocked by CORS policy`

**Solution**:
1. Verify `FRONTEND_URL` in Railway matches your Vercel URL exactly
2. Ensure no trailing slash in URLs
3. Redeploy Railway after updating FRONTEND_URL

### Database Connection Issues
**Problem**: `Can't reach database server`

**Solution**:
1. Check Railway PostgreSQL service is running
2. Verify `DATABASE_URL` is set correctly
3. Run migrations: `railway run pnpm --filter @cashflow/api prisma migrate deploy`

### Build Failures on Railway
**Problem**: `Cannot install with "frozen-lockfile"`

**Solution**:
- Already fixed with `nixpacks.toml` and `railway.json`
- Ensure these files are in repository root
- Verify Railway is deploying from root (not `apps/api`)

### API Not Loading Environment Variables
**Problem**: Backend shows default values instead of Railway variables

**Solution**:
1. Check Railway Variables tab - ensure all vars are set
2. Redeploy the service
3. Check deployment logs for loaded environment

---

## 📚 Useful Commands

### Local Development
```bash
# Start both frontend and backend
pnpm dev

# Start only backend
pnpm dev:api

# Start only frontend  
pnpm dev:web

# Run database migrations
pnpm db:migrate

# View database with Prisma Studio
pnpm db:studio
```

### Railway CLI
```bash
# Deploy manually
railway up

# View logs
railway logs

# Open Railway dashboard
railway open

# Run commands in Railway environment
railway run <command>
```

### Vercel CLI
```bash
# Deploy from local
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Open Vercel dashboard
vercel open
```

---

## 🔐 Security Notes

1. **Never commit `.env` files** - already in `.gitignore`
2. **Use strong secrets** - minimum 32 characters for JWT_SECRET and NEXTAUTH_SECRET
3. **Rotate API keys** regularly, especially RESEND_API_KEY
4. **Use environment variables** for all sensitive data
5. **Enable 2FA** on Railway and Vercel accounts

---

## 📞 Support

If you encounter issues:
1. Check Railway and Vercel deployment logs
2. Review browser console for frontend errors
3. Test API endpoints directly using Postman/Thunder Client
4. Verify all environment variables are set correctly

---

**Last Updated**: 2026-01-14
**Version**: 1.0.0
