'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PrivateRoute from '@/components/auth/PrivateRoute';
import Navbar from '@/components/layout/Navbar';
import { CheckCircle, Package, MapPin, CreditCard, Loader, Home } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  product_id: string;
  products?: {
    name: string;
    image: string;
    description: string;
  };
}

interface Order {
  id: string;
  total: string;
  subtotal: string;
  tax: string;
  shipping: string;
  status: string;
  payment_method: string;
  created_at: string;
  order_items: OrderItem[];
  shipping_addresses: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  estimatedDelivery?: string;
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided');
      setIsLoading(false);
      return;
    }

    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.order) {
        setOrder(data.order);
        // Clear cart after successful order
        localStorage.removeItem('cart');
      } else {
        setError(data.error || 'Failed to load order');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      setError('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PrivateRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <Loader className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Loading your order...</p>
          </div>
        </div>
      </PrivateRoute>
    );
  }

  if (error || !order) {
    return (
      <PrivateRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <div className="text-5xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Return to Home
            </button>
          </div>
        </div>
      </PrivateRoute>
    );
  }

  const estimatedDelivery = order.estimatedDelivery 
    ? new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'To be determined';

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Success Message */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order Confirmed! 🎉
              </h1>
              <p className="text-gray-600">
                Thank you for your purchase. Your order has been confirmed and will be delivered soon.
              </p>
            </div>

            {/* Order Number */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-2xl font-bold text-blue-600">
                #{order.id.substring(0, 12).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Delivery Information</h2>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-semibold text-gray-900 capitalize">{order.status}</p>
                </div>
                <div>
                  <p className="text-gray-600">Estimated Delivery</p>
                  <p className="font-semibold text-gray-900">{estimatedDelivery}</p>
                </div>
                <div>
                  <p className="text-gray-600">Order Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
              </div>
              <div className="text-sm space-y-1">
                <p className="font-semibold text-gray-900">
                  {order.shipping_addresses.first_name} {order.shipping_addresses.last_name}
                </p>
                <p className="text-gray-600">{order.shipping_addresses.address}</p>
                <p className="text-gray-600">
                  {order.shipping_addresses.city}, {order.shipping_addresses.state} {order.shipping_addresses.zip_code}
                </p>
                <p className="text-gray-600">{order.shipping_addresses.country}</p>
                <p className="text-gray-600 pt-2">{order.shipping_addresses.phone}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.order_items && order.order_items.length > 0 ? (
                order.order_items.map((item, index) => (
                  <div key={item.id || index} className="flex items-center gap-4 pb-4 border-b last:border-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                      {item.products?.image || '📦'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.products?.name || 'Product'}
                      </h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${parseFloat(item.price).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No items found</p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${parseFloat(order.tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${parseFloat(order.shipping).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t">
                <span>Total</span>
                <span>${parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {order.payment_method.replace('-', ' ')}
                </p>
              </div>
            </div>
          </div>

{/* Actions */}
<div className="flex flex-col sm:flex-row gap-4">
  <button
    onClick={() => router.push('/')}
    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
  >
    <Home className="w-5 h-5" />
    Continue Shopping
  </button>
  <button
    onClick={() => router.push('/orders')}
    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
  >
    View All Orders
  </button>
</div>
        </main>
      </div>
    </PrivateRoute>
  );
}
