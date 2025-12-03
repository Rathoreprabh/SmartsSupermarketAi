# 🚀 Complete Setup Guide - Smart Supermarket

Follow these steps to get your Smart Supermarket application running.

## Phase 1: Prerequisites ✅

### System Requirements
- **Node.js**: Version 18.17 or later
- **npm**: Version 9 or later (or yarn/pnpm)
- **Git**: For version control
- **Code Editor**: VSCode recommended

### Verify Installation
```bash
node --version    # Should be 18.17+
npm --version     # Should be 9+
git --version     # Any recent version
```

## Phase 2: External Services Setup 🔧

### 2.1 Supabase (Database & Auth)

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project:
   - Project name: `smart-supermarket`
   - Region: Choose closest to you
   - Database password: Save securely
4. Go to **Project Settings** → **API**
5. Copy these values:
   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon public key
   - `SUPABASE_SERVICE_ROLE_KEY`: service_role key

### 2.2 Stripe (Payments)

1. Go to [stripe.com](https://stripe.com)
2. Create a Stripe account
3. Go to **Developers** → **API Keys**
4. Copy:
   - `STRIPE_SECRET_KEY`: Secret key (starts with `sk_test_`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Publishable key (starts with `pk_test_`)

### 2.3 OpenAI (AI Features)

1. Go to [openai.com](https://openai.com)
2. Sign up and go to [API keys](https://platform.openai.com/api-keys)
3. Create new secret key
4. Copy: `OPENAI_API_KEY`

### 2.4 Pexels (Image API - Optional)

1. Go to [pexels.com/api](https://www.pexels.com/api/)
2. Sign up for API access
3. Copy: `PEXELS_API_KEY`

## Phase 3: Local Setup 💻

### 3.1 Clone Project

```bash
git clone https://github.com/yourusername/smart-supermarket.git
cd smart-supermarket
```

### 3.2 Install Dependencies

```bash
npm install
# or if you prefer yarn
yarn install
# or pnpm
pnpm install
```

### 3.3 Environment Variables

1. Create `.env.local` in project root:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your credentials:

```env
# Database Connection
DATABASE_URL=postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]

# NextAuth (Generate with: `openssl rand -base64 32`)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# AI APIs
OPENAI_API_KEY=sk-proj-your-key-here
COHERE_API_KEY=optional-cohere-key

# External APIs
PEXELS_API_KEY=optional-pexels-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.4 Generate NEXTAUTH_SECRET

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Copy the output to `NEXTAUTH_SECRET` in `.env.local`

## Phase 4: Database Setup 🗄️

### 4.1 Create Database Connection

The DATABASE_URL format should be:
```
postgresql://user:password@host:port/database
```

From Supabase dashboard:
1. Go to **Settings** → **Database**
2. Find Connection String
3. Copy the `URI` version
4. Paste into `.env.local`

### 4.2 Setup Database Schema

```bash
# Generate migration files
npm run db:generate

# Apply migrations to database
npm run db:push

# Verify with Drizzle Studio (optional)
npm run db:studio
```

### 4.3 Seed Sample Data

```bash
npm run db:seed
```

## Phase 5: Development Server 🎯

### 5.1 Start Development

```bash
npm run dev
```

You should see:
```
> next dev --turbo
  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
  - Environments: .env.local
```

### 5.2 Open in Browser

Visit: http://localhost:3000

You should see the Smart Supermarket homepage! 🎉

## Phase 6: Verification Checklist ✔️

- [ ] Node.js is installed (v18+)
- [ ] npm is installed (v9+)
- [ ] Supabase project created
- [ ] All API keys from external services
- [ ] `.env.local` file created with all keys
- [ ] `npm install` completed successfully
- [ ] `npm run db:generate` completed
- [ ] `npm run db:push` completed
- [ ] `npm run dev` starts without errors
- [ ] Browser loads http://localhost:3000

## Phase 7: Next Steps 🚀

### Create First Component

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
```

### Create API Route

Create `src/app/api/hello/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello from Smart Supermarket!' });
}
```

### Create Product Page

Create `src/app/products/page.tsx`:
```typescript
'use client';

import { useFetch } from '@/hooks/useFetch';

export default function ProductsPage() {
  const { data: products, loading, error } = useFetch('/api/products');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Products</h1>
      {/* Display products here */}
    </div>
  );
}
```

## Troubleshooting 🔧

### Port 3000 Already in Use
```bash
# Kill process on port 3000
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Error
1. Verify DATABASE_URL in `.env.local`
2. Check Supabase project is active
3. Verify credentials are correct
4. Test connection: `npm run db:studio`

### Missing Environment Variables
1. Check `.env.local` exists
2. Verify all required variables are set
3. Restart dev server after changes

### TypeScript Errors
```bash
npm run type-check
# or
npx tsc --noEmit
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run dev
```

## Additional Resources 📚

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support & Issues 💬

If you encounter issues:

1. Check this guide again
2. Search [GitHub Issues](https://github.com/yourusername/smart-supermarket/issues)
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version)
   - `.env.local` (without sensitive data)

## Deployment 🌐

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Create new project
4. Connect GitHub repo
5. Add environment variables
6. Deploy!

### Deploy to Other Platforms

See main README for Docker and other options.

---

**You're all set!** 🎉 Happy coding! 🚀
