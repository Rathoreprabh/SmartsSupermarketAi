# Architecture & Structure Guide

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 14 App                          │
│              (React Server & Client Components)             │
└─────────────────────────────────────────────────────────────┘
              ↓               ↓               ↓
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │  Pages/UI    │ │ API Routes   │ │  Components  │
      │  (React)     │ │  (Handlers)  │ │  (Reusable)  │
      └──────────────┘ └──────────────┘ └──────────────┘
              ↓               ↓               ↓
      ┌─────────────────────────────────────────────┐
      │         Services & Business Logic           │
      │    (Utils, Validations, Transformers)       │
      └─────────────────────────────────────────────┘
              ↓               ↓               ↓
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │  Zustand     │ │ React Hooks  │ │ API Clients  │
      │  (State)     │ │  (Custom)    │ │ (External)   │
      └──────────────┘ └──────────────┘ └──────────────┘
              ↓               ↓               ↓
      ┌─────────────────────────────────────────────┐
      │         Database Layer (Drizzle ORM)        │
      │   PostgreSQL / Supabase Connection Pool     │
      └─────────────────────────────────────────────┘
```

## 🗂️ Directory Structure

### `/src/app` - Next.js App Router

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Home page
├── globals.css             # Global styles & Tailwind
├── api/                    # API routes (server-side)
│   ├── products/
│   │   ├── route.ts        # GET/POST /api/products
│   │   └── [id]/route.ts   # GET/PUT/DELETE /api/products/[id]
│   ├── cart/
│   ├── orders/
│   ├── auth/
│   └── webhooks/
│       └── stripe.ts       # Stripe webhook handler
├── products/               # Product pages
│   ├── page.tsx            # /products
│   ├── [id]/
│   │   └── page.tsx        # /products/[id]
├── cart/                   # Cart page
├── checkout/               # Checkout flow
├── dashboard/              # User dashboard
│   ├── layout.tsx
│   ├── page.tsx
│   ├── orders/
│   └── settings/
└── auth/                   # Authentication pages
    ├── login/
    ├── signup/
    └── callback/
```

### `/src/components` - React Components

```
components/
├── ui/                     # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...
├── common/                 # Reusable components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Navigation.tsx
│   └── Loader.tsx
├── products/              # Product-specific
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   └── ProductDetail.tsx
├── cart/                  # Cart-specific
│   ├── CartItem.tsx
│   ├── CartSummary.tsx
│   └── EmptyCart.tsx
└── forms/                 # Form components
    ├── LoginForm.tsx
    ├── SignupForm.tsx
    └── ProductForm.tsx
```

### `/src/lib` - Utilities & Services

```
lib/
├── db/                    # Database
│   ├── index.ts          # Connection setup
│   ├── schema.ts         # Drizzle schema definitions
│   └── seed.ts           # Database seeding
├── supabase/             # Supabase client
│   └── client.ts
├── stripe.ts             # Stripe client
├── utils.ts              # General utilities
├── api-response.ts       # API response helpers
└── validations/          # Zod schemas
    └── index.ts
```

### `/src/store` - State Management (Zustand)

```
store/
├── userStore.ts          # User & auth state
└── cartStore.ts          # Shopping cart state
```

### `/src/hooks` - Custom React Hooks

```
hooks/
├── useAsync.ts           # Generic async handler
├── useFetch.ts           # Fetch with caching
└── useLocalStorage.ts    # Local storage sync
```

### `/src/config` - Configuration

```
config/
└── index.ts              # App constants & config
```

## 🔄 Data Flow Patterns

### Pattern 1: Server Component → API Route → Database

```typescript
// Page.tsx (Server Component)
async function getProducts() {
  const res = await fetch('http://localhost:3000/api/products');
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();
  return <ProductList products={products} />;
}

// api/products/route.ts
export async function GET() {
  const data = await db.select().from(products);
  return NextResponse.json(data);
}
```

### Pattern 2: Client Component → Store → API

```typescript
// ProductCard.tsx (Client Component)
'use client';

import { useCartStore } from '@/store/cartStore';

export function ProductCard({ product }) {
  const { addItem } = useCartStore();

  return (
    <button onClick={() => addItem(product)}>
      Add to Cart
    </button>
  );
}
```

### Pattern 3: Hook → API → Transform → State

```typescript
// useProducts.ts
export function useProducts() {
  return useFetch('/api/products', {
    onSuccess: (data) => {
      // Transform data if needed
      return transformProducts(data);
    }
  });
}

// Usage in Component
export function ProductsPage() {
  const { data: products } = useProducts();
}
```

## 🔐 Authentication Flow

```
User Login
    ↓
LoginForm.tsx (Client)
    ↓
POST /api/auth/login (Route)
    ↓
NextAuth.js validation
    ↓
Database check
    ↓
Session created
    ↓
Redirect to dashboard
    ↓
useUserStore updated
```

## 💳 Payment Flow (Stripe)

```
Cart Checkout
    ↓
POST /api/checkout
    ↓
Create Stripe PaymentIntent
    ↓
Return clientSecret
    ↓
StripeCheckout Component (Stripe.js)
    ↓
User enters payment info
    ↓
Webhook: POST /api/webhooks/stripe
    ↓
Verify & process
    ↓
Update Order status
    ↓
Send confirmation email
```

## 📊 Database Schema

### Core Tables

```sql
-- Users
users (id, email, name, image, password, role, created_at)

-- Products
products (id, name, description, price, stock, category, image, created_at)

-- Orders
orders (id, user_id, total, status, items, created_at)

-- Cart
carts (id, user_id, created_at)
cart_items (id, cart_id, product_id, quantity, price, created_at)

-- Reviews
reviews (id, product_id, user_id, rating, content, created_at)
```

### Relationships

```
User (1) ──→ (N) Cart
User (1) ──→ (N) Order
User (1) ──→ (N) Review
Product (1) ──→ (N) CartItem
Product (1) ──→ (N) Review
Product (1) ──→ (N) OrderItem
Cart (1) ──→ (N) CartItem
```

## 🎯 Component Lifecycle

### Server Component (Next.js)

```
Page Component (Server)
    ↓
Fetch Data (async)
    ↓
Pass as Props (JSON)
    ↓
Render HTML (Server)
    ↓
Send to Browser
    ↓
Hydrate with Client Components
    ↓
Interactive UI
```

### Client Component

```
'use client'
    ↓
useState, useEffect
    ↓
Event Handlers
    ↓
State Updates
    ↓
Re-render
    ↓
Update DOM
```

## 🚀 Performance Optimization

### 1. Code Splitting
- Automatic with Next.js App Router
- Dynamic imports for heavy components

### 2. Caching
- ISR (Incremental Static Regeneration)
- API response caching in hooks
- Browser caching with Cache-Control headers

### 3. Image Optimization
- Next.js `<Image>` component
- Automatic WebP conversion
- Responsive images

### 4. Database
- Connection pooling (Supabase)
- Indexes on frequently queried fields
- Query optimization with Drizzle

## 🔐 Security Layers

```
Browser (HTTPS)
    ↓
CORS & CSP Headers
    ↓
NextAuth.js Validation
    ↓
Zod Input Validation
    ↓
Database Query Sanitization (Drizzle ORM)
    ↓
Row Level Security (Supabase)
```

## 📦 External Services Integration

### Supabase
- PostgreSQL database
- Real-time subscriptions
- Row Level Security
- Authentication helpers

### Stripe
- Payment processing
- Webhook handling
- Card tokenization

### OpenAI / Cohere
- Product recommendations
- Natural language search
- Content generation

## 🔄 Error Handling

```typescript
// API Route Level
try {
  const data = await db.query();
  return successResponse(data);
} catch (error) {
  return errorResponse('Database error', 500);
}

// Hook Level
try {
  const response = await fetch(url);
  setData(await response.json());
} catch (error) {
  setError(error);
}

// Component Level
if (error) return <ErrorBoundary error={error} />;
if (loading) return <LoadingSpinner />;
```

## 📈 Scalability Considerations

1. **Database**: Use Supabase Read Replicas for read-heavy workloads
2. **Caching**: Implement Redis for session & cache layer
3. **CDN**: Use Vercel Edge Network or Cloudflare
4. **Search**: Implement Elasticsearch for product search
5. **Message Queue**: Add Bull/RabbitMQ for async jobs
6. **File Storage**: Use Supabase Storage or AWS S3

## 🧪 Testing Structure

```
tests/
├── unit/           # Component tests
├── integration/    # API route tests
├── e2e/            # Full user flows
└── fixtures/       # Mock data
```

---

This architecture ensures scalability, maintainability, and follows modern Next.js best practices.
