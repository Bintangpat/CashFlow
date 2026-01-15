# ⚡ SIMPLE: Run Migrations - Pilih Salah Satu

## 🎯 Method 1: Update railway.json (TERMUDAH!)

### 1. Edit file `railway.json` di project Anda

**Ubah baris 5 dari:**
```json
"buildCommand": "pnpm install --frozen-lockfile && pnpm --filter @cashflow/api build"
```

**Menjadi:**
```json
"buildCommand": "pnpm install --frozen-lockfile && pnpm --filter @cashflow/api db:migrate:deploy && pnpm --filter @cashflow/api build"
```

### 2. Commit dan Push
```bash
git add railway.json
git commit -m "chore: run migrations"
git push
```

Railway akan otomatis redeploy dan run migrations!

### 3. KEMBALIKAN railway.json (PENTING!)

Setelah deployment berhasil, **kembalikan** railway.json ke semula:
```json
"buildCommand": "pnpm install --frozen-lockfile && pnpm --filter @cashflow/api build"
```

Lalu commit lagi:
```bash
git add railway.json
git commit -m "chore: restore build command"
git push
```

---

## 🔧 Method 2: Manual SQL di Supabase

Jika tidak mau edit railway.json bolak-balik:

### 1. Login ke Supabase
   - Go to [supabase.com](https://supabase.com)
   - Pilih project Anda

### 2. Buka SQL Editor
   - Click **SQL Editor** di sidebar
   - Click **+ New query**

### 3. Copy-Paste SQL
   - Buka file: `apps/api/prisma/migrations/MANUAL_MIGRATION_SUPABASE.sql`
   - Copy **SEMUA** isi file
   - Paste ke Supabase SQL Editor
   - Click **Run**

### 4. Verify
   Go to **Table Editor** - harusnya ada 8 tables:
   - users
   - products
   - sales
   - sale_items
   - cash_transactions
   - otp_tokens
   - stock_receivings
   - _prisma_migrations

---

## ✅ Jangan Lupa: Update CORS_ORIGINS

Di Railway Dashboard → Variables, tambahkan:
```env
CORS_ORIGINS=https://cash-flow-two-iota.vercel.app
```

---

## Verify Sukses

1. **Railway Logs** harus show:
   ```
   🌐 CORS allowed origins: [ 'https://cash-flow-two-iota.vercel.app' ]
   ```

2. **Login di Vercel** harus work tanpa error!

---

**Saya rekomendasikan Method 2 (Manual SQL)** - lebih simple, sekali jalan, tanpa perlu edit file bolak-balik! 🚀
