# HQ Platform - Monorepo Implementation

Complete Turborepo monorepo architecture with TanStack Start + Next.js + tRPC + Zephr Integration.

## Architecture Overview

### Applications

1. **Indecks** (Client Access Central) - Next.js app for client user management
2. **HQ Admin** - Next.js app for internal configuration and account management
3. **Sales Dashboard** - TanStack Start app for analytics and reporting

### Core Features

- **Shared tRPC API** (`/apps/api`) - Single source of truth for all clients
- **Type-safe end-to-end** - Zod schemas + TypeScript
- **HMAC-signed Zephr API integration** - Secure communication with Zephr Admin/Public APIs
- **Docker containerized** - Postgres, Redis, MQ workers
- **Turborepo build pipeline** - Optimized with pnpm workspaces

## Directory Structure

```
/
├── apps/
│   ├── indecks/          # Next.js - Client access central
│   ├── hq-admin/         # Next.js - Admin portal (placeholder)
│   ├── sales-dashboard/  # TanStack Start - Analytics app
│   ├── api/              # Node.js - tRPC API server
│   └── workers/          # Background job processors (placeholder)
├── packages/
│   ├── clients/
│   │   └── zephr/        # Generated TypeScript client from OpenAPI
│   ├── ui/               # Shared ShadCN components (placeholder)
│   ├── db/               # Prisma schema & client (placeholder)
│   ├── schemas/          # Shared Zod schemas
│   └── config/           # Shared configs (placeholder)
├── docker/
│   ├── docker-compose.yml
│   └── Dockerfile.api
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8.15+
- Docker & Docker Compose

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment variables:

```bash
# apps/api/.env
ZEPHR_BASE_URL=https://api.zephr.com
ZEPHR_HMAC_KEY=your-hmac-key
ZEPHR_HMAC_SECRET=your-hmac-secret
COMPANY_ID=your-company-id
PORT=3001

# apps/indecks/.env.local
NEXT_PUBLIC_TRPC_URL=http://localhost:3001/trpc
NEXT_PUBLIC_COMPANY_ID=your-company-id

# apps/sales-dashboard/.env
VITE_TRPC_URL=http://localhost:3001/trpc
VITE_COMPANY_ID=your-company-id
```

3. Start Docker services (Postgres, Redis):

```bash
pnpm docker:up
```

4. Start all apps in dev mode:

```bash
pnpm dev
```

Or start individually:

```bash
cd apps/api && pnpm dev
cd apps/indecks && pnpm dev
cd apps/sales-dashboard && pnpm dev
```

### Application URLs

- **API**: http://localhost:3001
- **Indecks**: http://localhost:3002
- **HQ Admin**: http://localhost:3003 (to be implemented)
- **Sales Dashboard**: http://localhost:3004

## Features

### User Management (Indecks)

- List all users in a company
- View user details with TanStack Table
- Manage product grants
- Manage user profiles (MyLaw, Radar, Scholar, Newsvault)

### Profile Management

- **MyLawProfile** - Always available to all users
- **RadarProfile** - Available with `radar-prod` product grant
- **ScholarProfile** - Available with `scholar-prod` product grant
- **SettingsProfile** - Available with `newsvault-prod` product grant

### Analytics Dashboard (Sales Dashboard)

- **Real-time KPIs** - Total users, active users, accounts, and grants
- **User Growth Metrics** - Track user acquisition and activity rates
- **Product Adoption Charts** - Visualize product usage across accounts
- **Revenue Trends** - Monitor revenue and subscription metrics
- **Top Accounts** - View accounts ranked by user count
- **Built with TanStack Start** - Modern full-stack React framework
- **Interactive Charts** - Powered by Recharts

### Type Safety

All API calls are fully type-safe from client to server:

```typescript
// ✅ Type-safe query
const { data: users } = trpc.company.listUsers.useQuery({ companyId })

// ✅ Type-safe mutation
trpc.company.updateProfile.mutate({
  userId: 'user-123',
  accountId: 'account-456',
  appId: 'MyLawProfile',
  data: {
    newsDigest: true,
    favoriteTopics: ['legal', 'tech'],
    alertFrequency: 'daily',
    emailNotifications: true,
  }
})
```

## Development Workflow

### Build Commands

```bash
# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Type check all packages
pnpm typecheck
```

### Docker Commands

```bash
# Start services
pnpm docker:up

# Stop services
pnpm docker:down

# Build API Docker image
docker build -f docker/Dockerfile.api -t hq-platform-api .
```

## API Routes

### Company Router

- `company.listUsers` - List all users in company
- `company.grantProduct` - Grant product access to user
- `company.removeProduct` - Remove product access from user
- `company.listAvailableProfiles` - List profiles available to user
- `company.getProfile` - Get user profile data
- `company.updateProfile` - Update user profile data

### Analytics Router

- `analytics.getUserGrowth` - Get user growth metrics and activity rates
- `analytics.getProductAdoption` - Get product adoption statistics
- `analytics.getAccountMetrics` - Get account and grant metrics
- `analytics.getProfileUsage` - Get profile usage statistics
- `analytics.getRevenueMetrics` - Get revenue trends (mock data)
- `analytics.getTopAccounts` - Get top accounts by user count

## Zephr Integration

### HMAC Authentication

All Zephr API calls are authenticated using HMAC-SHA256 signatures:

```typescript
const stringToSign = `${method}\n${path}\n${timestamp}\n${body}`
const signature = crypto
  .createHmac('sha256', hmacSecret)
  .update(stringToSign)
  .digest('hex')
```

### Supported Endpoints

- Account Management (v3, v4)
- User Management (v3)
- Grant Management (v3)
- Profile Management (v3)
- Product Listing (v3)

## Production Deployment

### Build for Production

```bash
# Build all apps
pnpm build

# Build Docker images
docker build -f docker/Dockerfile.api -t hq-platform-api .
docker build -f apps/indecks/Dockerfile -t hq-platform-indecks .
```

### Environment Variables

Production `.env`:

```bash
# Zephr
ZEPHR_BASE_URL=https://api.production.zephr.com
ZEPHR_HMAC_KEY=prod-key
ZEPHR_HMAC_SECRET=prod-secret
COMPANY_ID=prod-company-id

# Database
DATABASE_URL=postgresql://user:pass@prod-db:5432/hq_platform

# Redis
REDIS_URL=redis://prod-redis:6379
```

## Testing

### Manual Testing Checklist

**API Testing:**

```bash
# Test user list endpoint
curl http://localhost:3001/trpc/company.listUsers?input={"companyId":"test-company"}
```

**Frontend Testing:**

1. Open http://localhost:3002
2. Verify user table loads
3. Click "Manage Products" - should open modal
4. Click "Manage Profiles" - should show available profiles
5. Edit MyLaw profile (always available)
6. Attempt to edit Radar profile (should check product grant first)

### Type Safety Verification

These should produce TypeScript errors:

```typescript
// ❌ Wrong input type
trpc.company.listUsers.useQuery({ wrongField: 'test' })

// ❌ Wrong appId
trpc.company.getProfile.useQuery({
  userId: 'x',
  accountId: 'y',
  appId: 'InvalidProfile'
})

// ❌ Wrong profile data shape
trpc.company.updateProfile.mutate({
  userId: 'x',
  accountId: 'y',
  appId: 'MyLawProfile',
  data: { invalidField: true }
})
```

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **API**: tRPC + Fastify
- **Frontend**: Next.js 14 + React 18
- **Analytics**: TanStack Start (planned)
- **Validation**: Zod
- **Data Fetching**: TanStack Query (React Query)
- **Tables**: TanStack Table
- **Database**: PostgreSQL (via Docker)
- **Cache**: Redis (via Docker)
- **Container**: Docker + Docker Compose

## Next Steps

- [ ] Implement HQ Admin app
- [ ] Implement Sales Dashboard with TanStack Start
- [ ] Add authentication middleware
- [ ] Add Prisma database layer
- [ ] Implement background workers
- [ ] Add comprehensive test suite
- [ ] Set up CI/CD pipeline
- [ ] Add monitoring and logging

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
