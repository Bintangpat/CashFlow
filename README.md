# CashFlow - Business Finance & POS Web App

Aplikasi web keuangan bisnis untuk UMKM dengan fitur Point of Sales (POS), manajemen produk, pencatatan keuangan, dan laporan laba rugi.

## Tech Stack

- **Frontend:** Next.js 14, React, shadcn/ui, TailwindCSS
- **Backend:** Node.js, Express.js, Prisma ORM
- **Database:** PostgreSQL (Supabase)
- **Package Manager:** pnpm (Workspaces)

## Project Structure

```
cashflow/
├── apps/
│   ├── api/          # Backend Express.js
│   └── web/          # Frontend Next.js
├── packages/
│   └── shared-types/ # Shared TypeScript interfaces
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Supabase account

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Run database migrations
pnpm db:migrate

# Start development servers
pnpm dev
```

### Environment Variables

**Backend (apps/api/.env):**
```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
JWT_SECRET="your-secret-key"
PORT=3001
```

**Frontend (apps/web/.env.local):**
```
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm dev:api` | Start backend only |
| `pnpm dev:web` | Start frontend only |
| `pnpm build` | Build all apps |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:studio` | Open Prisma Studio |

## License

MIT
