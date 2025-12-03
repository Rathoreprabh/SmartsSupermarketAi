# Smart Supermarket - Modern E-commerce Platform

A full-stack, AI-powered supermarket application built with the latest modern tech stack.

## 🚀 Features

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Drizzle ORM** - Type-safe database queries
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Stripe Integration** - Payment processing
- **AI Integration** - OpenAI & Cohere APIs
- **Real-time Updates** - Supabase Realtime
- **Authentication** - NextAuth.js ready structure
- **State Management** - Zustand
- **Form Validation** - Zod schemas
- **Component Library** - shadcn/ui compatible

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (Supabase)
- Stripe account (for payments)
- OpenAI or Cohere API keys (for AI features)

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo>
cd smart-supermarket

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory. Copy from `.env.example`:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth (for authentication)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-: openssl rand -base64 32

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# AI APIs
OPENAI_API_KEY=sk-proj-your-key
COHERE_API_KEY=your-cohere-key

# External APIs
PEXELS_API_KEY=your-pexels-key

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Initialize your Supabase project and set up PostgreSQL:

```bash
# Generate database migrations
npm run db:generate

# Push migrations to database
npm run db:push

# (Optional) Open Drizzle Studio to manage data
npm run db:studio

# (Optional) Seed database with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📁 Project Structure

```
smart-supermarket/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles
│   │   └── api/                # API routes
│   ├── components/
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts        # Database connection
│   │   │   └── schema.ts       # Database schema
│   │   ├── supabase/
│   │   │   └── client.ts       # Supabase client
│   │   ├── stripe.ts           # Stripe client
│   │   ├── utils.ts            # Utility functions
│   │   └── validations/        # Zod schemas
│   ├── store/                  # Zustand stores
│   │   ├── userStore.ts
│   │   └── cartStore.ts
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAsync.ts
│   │   ├── useFetch.ts
│   │   └── useLocalStorage.ts
│   └── types/                  # TypeScript types
├── public/                     # Static assets
├── drizzle/                    # Database migrations
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── next.config.js             # Next.js configuration
├── components.json            # shadcn/ui configuration
└── package.json               # Dependencies
```

## 🎯 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server

# Linting & Formatting
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript
npm run format           # Format with Prettier

# Database
npm run db:generate      # Generate migrations
npm run db:push          # Push migrations to DB
npm run db:studio        # Open Drizzle Studio
npm run db:seed          # Seed database
```

## 🛠️ Tech Stack Details

### Frontend
- **Next.js 14** - React framework with server components
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animations
- **React Hook Form** - Form management
- **Zod** - Schema validation

### State Management
- **Zustand** - Lightweight state management
- **LocalStorage** - Client-side persistence

### Backend & Database
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Database (via Supabase)
- **Supabase** - Backend services

### External Services
- **Stripe** - Payment processing
- **NextAuth.js** - Authentication (ready to implement)
- **OpenAI/Cohere** - AI features
- **Pexels** - Image API

### Developer Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 🔐 Security Best Practices

- ✅ Environment variables for sensitive data
- ✅ Type-safe queries with Drizzle ORM
- ✅ Input validation with Zod
- ✅ CORS and security headers configured
- ✅ Prepared statements against SQL injection

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Supabase](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Push to GitHub first
git add .
git commit -m "Initial commit"
git push origin main

# Then deploy via Vercel dashboard
# https://vercel.com/new
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support, email support@smartmarket.com or open an issue in the repository.

## 🎉 Getting Started Next Steps

1. ✅ Install dependencies
2. ✅ Set up environment variables
3. ✅ Initialize database
4. ✅ Create UI components with `npx shadcn-ui@latest add [component]`
5. ✅ Build your features!

Happy coding! 🚀
