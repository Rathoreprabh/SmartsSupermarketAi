# Code Examples & Common Patterns

## 🎯 Quick Reference

### Creating a New Page

**File: `src/app/about/page.tsx`**

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Smart Supermarket',
};

export default function AboutPage() {
  return (
    <div className="container-main py-20">
      <h1 className="text-4xl font-bold mb-4">About Us</h1>
      <p className="text-lg text-muted-foreground">
        Welcome to Smart Supermarket!
      </p>
    </div>
  );
}
```

### Creating an API Route

**File: `src/app/api/products/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api-response';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, params.id))
      .limit(1);

    if (!product.length) {
      return notFoundResponse();
    }

    return successResponse(product[0]);
  } catch (error) {
    return errorResponse('Failed to fetch product');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication

    const body = await request.json();
    const updated = await db
      .update(products)
      .set(body)
      .where(eq(products.id, params.id))
      .returning();

    return successResponse(updated[0]);
  } catch (error) {
    return errorResponse('Failed to update product');
  }
}
```

### Using Hooks in Components

**File: `src/components/products/ProductsList.tsx`**

```typescript
'use client';

import { useFetch } from '@/hooks/useFetch';
import { Product } from '@/lib/db/schema';
import ProductCard from './ProductCard';

export default function ProductsList() {
  const {
    data: products,
    loading,
    error,
    refetch,
  } = useFetch<Product[]>('/api/products');

  if (loading) return <div className="text-center py-10">Loading...</div>;

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">Error: {error.message}</p>
        <button onClick={refetch} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products?.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Using Zustand Store

**File: `src/components/cart/AddToCartButton.tsx`**

```typescript
'use client';

import { useCartStore } from '@/store/cartStore';
import { Product } from '@/lib/db/schema';
import toast from 'react-hot-toast';

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    toast.success(`${product.name} added to cart!`);
  };

  return (
    <button onClick={handleAddToCart} className="btn-primary w-full">
      Add to Cart
    </button>
  );
}
```

### Form with Validation

**File: `src/components/forms/ProductForm.tsx`**

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductSchema, CreateProductInput } from '@/lib/validations';
import toast from 'react-hot-toast';

export default function ProductForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
  });

  const onSubmit = async (data: CreateProductInput) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create product');

      toast.success('Product created successfully!');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Product Name</label>
        <input
          {...register('name')}
          className="w-full px-3 py-2 border border-border rounded-lg"
          placeholder="Enter product name"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Price</label>
        <input
          {...register('price', { valueAsNumber: true })}
          type="number"
          step="0.01"
          className="w-full px-3 py-2 border border-border rounded-lg"
          placeholder="0.00"
        />
        {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
}
```

### Database Query Examples

**File: `src/lib/db/queries.ts`**

```typescript
import { db } from './index';
import { products, orders, users } from './schema';
import { eq, gt, like, and } from 'drizzle-orm';

// Get all products in category
export async function getProductsByCategory(category: string) {
  return db
    .select()
    .from(products)
    .where(and(
      eq(products.category, category),
      eq(products.isActive, true)
    ));
}

// Search products
export async function searchProducts(query: string) {
  return db
    .select()
    .from(products)
    .where(like(products.name, `%${query}%`))
    .limit(20);
}

// Get user's recent orders
export async function getUserOrders(userId: string, limit: number = 10) {
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(orders.createdAt)
    .limit(limit);
}

// Get high-value products
export async function getHighValueProducts(minPrice: number) {
  return db
    .select()
    .from(products)
    .where(gt(products.price, minPrice))
    .orderBy(products.price);
}

// Complex join query
export async function getUserOrderDetails(userId: string) {
  return db
    .select({
      orderId: orders.id,
      orderTotal: orders.total,
      orderStatus: orders.status,
      userName: users.name,
      userEmail: users.email,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.userId, userId));
}
```

### Custom Hook Example

**File: `src/hooks/useProducts.ts`**

```typescript
import { useEffect, useState } from 'react';
import { Product } from '@/lib/db/schema';
import { useFetch } from './useFetch';

interface UseProductsOptions {
  category?: string;
  limit?: number;
}

export function useProducts(options?: UseProductsOptions) {
  const params = new URLSearchParams();
  if (options?.category) params.append('category', options.category);
  if (options?.limit) params.append('limit', options.limit.toString());

  const { data, loading, error, refetch } = useFetch<Product[]>(
    `/api/products?${params.toString()}`
  );

  return {
    products: data || [],
    loading,
    error,
    refetch,
  };
}
```

### Middleware Example

**File: `src/middleware.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('token');
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
```

### Authentication Pattern

**File: `src/app/api/auth/login/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user.length) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password (TODO: use bcrypt)
    // const validPassword = await bcrypt.compare(password, user[0].password);

    // Create session / JWT token
    const response = NextResponse.json({ success: true });
    // response.cookies.set('token', token, { httpOnly: true });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Error Boundary Component

**File: `src/components/ErrorBoundary.tsx`**

```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="font-bold text-red-800">Something went wrong</h2>
          <p className="text-red-700">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Stripe Checkout Integration

**File: `src/components/checkout/StripeCheckout.tsx`**

```typescript
'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });

      if (error) {
        console.error(error);
        return;
      }

      // Send to backend
      const response = await fetch('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({ paymentMethodId: paymentMethod.id }),
      });

      const result = await response.json();
      // Handle result
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn-primary w-full"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function StripeCheckout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
```

### Using Utility Functions

```typescript
import {
  cn,
  formatCurrency,
  formatDate,
  truncate,
  generateSlug,
  isValidEmail,
  getInitials,
} from '@/lib/utils';

// Combining classes
const buttonClass = cn(
  'px-4 py-2 rounded',
  condition && 'bg-blue-500',
  'hover:bg-opacity-90'
);

// Format values
const price = formatCurrency(99.99); // "$99.99"
const date = formatDate(new Date()); // "December 25, 2024"
const name = truncate('Long product name...', 20); // "Long product nam..."
const slug = generateSlug('My Product'); // "my-product"

// Validation
const isValid = isValidEmail('user@example.com'); // true

// Get initials
const initials = getInitials('John Doe'); // "JD"
```

---

## 📌 Best Practices

1. **Always use TypeScript** - Catch errors at compile time
2. **Validate inputs** - Use Zod for API inputs
3. **Handle errors gracefully** - Show user-friendly messages
4. **Use proper status codes** - 200, 201, 400, 401, 404, 500
5. **Implement loading states** - Show feedback to users
6. **Cache when possible** - Reduce database queries
7. **Keep components small** - Single responsibility
8. **Use React hooks properly** - Follow rules of hooks
9. **Environment variables** - Never commit secrets
10. **Comment complex code** - Help future you and teammates

---

Happy coding! 🚀
