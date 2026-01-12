Tentu, ini adalah versi **PRD v2.0** yang telah diperbarui secara komprehensif. Dokumen ini disesuaikan dengan standar pengembangan modern menggunakan **TypeScript** secara menyeluruh (End-to-End Type Safety), arsitektur **Next.js** (App Router), library UI **shadcn/ui**, dan **Node.js** backend terpisah yang diatur dalam workspace **pnpm**.

---

# PRD — Web App Keuangan Bisnis (POS & Finance)

**Versi:** 2.0 (Technical Spec Updated)
**Status:** Ready for Development
**Tech Stack:** TypeScript, Next.js, Node.js, shadcn/ui, pnpm Workspaces
**Target Pengguna:** UMKM, Toko Retail, Bisnis Jasa.

---

## 1. Arsitektur & Tech Stack

Dokumen ini mengasumsikan penggunaan **Monorepo** (disarankan) atau struktur Polyrepo dengan `pnpm` untuk manajemen paket yang efisien.

### 1.1 Core Technologies

* **Language:** TypeScript v5.x (Strict Mode).
* **Package Manager:** pnpm (Fitur Workspaces untuk sharing types/DTO).
* **Frontend:**
* Framework: Next.js 14/15 (App Router).
* UI Library: shadcn/ui (berbasis Radix UI & Tailwind CSS).
* State Management: React Query (TanStack Query) untuk server state, Zustand (opsional) untuk client state.
* Form Handling: React Hook Form + Zod (Schema Validation).


* **Backend:**
* Runtime: Node.js.
* Framework: Express.js atau Fastify (dengan arsitektur Service/Controller).
* ORM: Prisma atau Drizzle ORM.
* Database: PostgreSQL.


* **Authentication:** JWT (JSON Web Token) - HttpOnly Cookies.

### 1.2 Struktur Project (Saran pnpm Workspace)

```text
/apps
  /web (Next.js + shadcn/ui)
  /api (Node.js Express/Fastify)
/packages
  /shared-types (Interface TS yang dipakai Frontend & Backend)
  /ui (Opsional: Shared UI config)

```

---

## 2. Fitur & Spesifikasi UI (shadcn/ui mapping)

### 2.1 Manajemen Produk

**User Story:** Owner/Admin dapat melakukan CRUD produk dengan validasi harga.

* **UI Components:**
* `Table` (TanStack Table) untuk list produk (Pagination, Sorting, Filtering).
* `Dialog` / `Sheet` untuk form tambah/edit produk.
* `Form` components (`Input`, `Select`, `Switch` untuk status aktif).
* `Toast` untuk notifikasi sukses/gagal.


* **Business Logic:**
* Validasi `zod`: `cost_price` harus <= `sell_price` (warning level) atau validasi angka positif.
* Format mata uang disimpan sebagai `integer` (contoh: Rp10.000 disimpan `10000`).



### 2.2 Sistem Kasir (Point of Sales)

**User Story:** Kasir dapat memilih produk, mengatur kuantitas, dan memproses pembayaran.

* **UI Components:**
* Layout: Split View (Kiri: Grid Produk, Kanan: Cart/Summary).
* `Card` untuk tampilan item produk.
* `Command` (CMDK) untuk pencarian produk cepat (search bar).
* `ScrollArea` untuk daftar belanjaan (cart).
* `Button` dengan state loading saat submit transaksi.


* **Frontend Logic:**
* Optimistic UI update saat menambah item ke keranjang.
* Perhitungan subtotal dilakukan di client-side untuk responsivitas, divalidasi ulang di backend.



### 2.3 Manajemen Keuangan (Pemasukan/Pengeluaran)

**User Story:** Mencatat biaya operasional atau suntikan modal.

* **UI Components:**
* `Tabs` untuk beralih antara view "Pemasukan" dan "Pengeluaran".
* `Calendar` / `DatePicker` untuk memilih tanggal transaksi.
* `Select` untuk kategori (Sewa, Gaji, Listrik, Lainnya).
* `Textarea` untuk catatan.



### 2.4 Dashboard & Laporan

**User Story:** Visualisasi performa bisnis (Laba/Rugi).

* **UI Components:**
* `Card` untuk KPI utama (Omzet, Laba Kotor, Laba Bersih).
* Charts (menggunakan Recharts atau library chart shadcn):
* Bar Chart: Penjualan 7 hari terakhir.
* Line Chart: Tren laba bersih.


* `DateRangePicker` untuk filter periode laporan.



---

## 3. Data Model (TypeScript Interfaces)

Disarankan diletakkan di folder `/packages/shared-types`.

```typescript
// Enums
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

// Product Interface
export interface Product {
  id: string; // UUID
  name: string;
  sku?: string | null;
  cost_price: number; // Disimpan dalam satuan terkecil (rupiah)
  sell_price: number;
  stock?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Cart Item (Frontend only helper)
export interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

// Sale Transaction (Header)
export interface Sale {
  id: string;
  transaction_date: Date;
  total_amount: number; // Total omzet (Gross Sales)
  total_profit: number; // Calculated backend (Snapshot)
  items: SaleItem[];
  created_by_user_id: string;
}

// Sale Item (Detail - PENTING: Snapshot Harga)
export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string; // Snapshot nama (jika nama produk berubah)
  quantity: number;
  cost_price_snapshot: number; // Harga modal SAAT transaksi terjadi
  sell_price_snapshot: number; // Harga jual SAAT transaksi terjadi
}

// Operational Transaction
export interface CashTransaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  notes?: string;
  transaction_date: Date;
}

// API Response Wrappers
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any;
}

```

---

## 4. Spesifikasi API (Backend Node.js)

Format: `JSON`, Protokol: `REST`.

### 4.1 Products

* `GET /api/products` - List produk (support query: `?search=&active=true`).
* `POST /api/products` - Tambah produk.
* `PUT /api/products/:id` - Update produk.
* `DELETE /api/products/:id` - Soft delete.

### 4.2 Sales (Kasir)

* `POST /api/sales`
* **Body:** `{ items: [{ productId: string, quantity: number }] }`
* **Logic Backend:**
1. Ambil data produk terbaru dari DB.
2. Validasi stok (jika ada fitur stok).
3. Buat record `Sale`.
4. Loop items: Simpan `SaleItem` dengan mengambil `cost_price` dan `sell_price` dari data DB saat ini (Snapshot).
5. Update stok produk.
6. Return total & struct data.





### 4.3 Finance

* `POST /api/finance/entry` - Input pemasukan/pengeluaran.
* `GET /api/finance/summary` - Mengambil ringkasan saldo kas (Total Masuk - Total Keluar).

### 4.4 Analytics (Dashboard)

* `GET /api/analytics/dashboard`
* **Query:** `?startDate=...&endDate=...`
* **Response:**
* `gross_sales`: Sum of `Sale.total_amount`
* `cogs`: Sum of (`SaleItem.quantity` * `SaleItem.cost_price_snapshot`)
* `gross_profit`: `gross_sales` - `cogs`
* `operational_expenses`: Sum of `CashTransaction` (Type: EXPENSE)
* `net_profit`: `gross_profit` - `operational_expenses`





---

## 5. Alur Validasi & Kalkulasi (Logic Inti)

### Kalkulasi Laba (Critical)

Jangan menghitung laba berdasarkan harga produk *saat ini*, tapi berdasarkan harga *saat transaksi terjadi*.

> **Rumus Backend:**
> `Laba Kotor Item` = (`sell_price_snapshot` - `cost_price_snapshot`) * `quantity`

### Keamanan Frontend (Next.js Middleware)

* Gunakan Middleware Next.js untuk memproteksi routes `/dashboard`, `/products`.
* Token JWT dikirim via Headers `Authorization: Bearer <token>` atau HttpOnly Cookie ke backend Node.js.

---

## 6. Development Roadmap (Checklist)

1. **Setup Phase:**
* [ ] Init pnpm workspace (apps/web, apps/api, packages/shared).
* [ ] Setup Database (PostgreSQL) & ORM.
* [ ] Install shadcn/ui di Next.js.


2. **Backend Development:**
* [ ] CRUD Product API.
* [ ] Transaction Logic (Sales & Snapshotting).
* [ ] Reporting Queries (Agregasi SQL).


3. **Frontend Development:**
* [ ] Product Management Page (Table + Forms).
* [ ] POS Page (Grid + Cart Logic).
* [ ] Dashboard Page (Charts + Summary Cards).


4. **Integration & Testing:**
* [ ] Integrasi API dengan React Query.
* [ ] Testing aliran data Laba Rugi (pastikan hitungan akurat).



---

### Langkah Selanjutnya

Untuk memulai implementasi, bagian mana yang ingin Anda prioritaskan?

1. **Setup Project Structure:** Saya buatkan struktur folder dan `package.json` untuk pnpm workspace (Next.js + Node).
2. **Backend Logic:** Saya buatkan skema Database (Prisma Schema) dan Logic controller untuk `POST /sales` (karena ini yang paling tricky).
3. **Frontend POS:** Saya buatkan komponen kasir menggunakan shadcn/ui dan state managementnya.