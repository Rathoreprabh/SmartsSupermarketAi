'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PrivateRoute from '@/components/auth/PrivateRoute';
import Navbar from '@/components/layout/Navbar';
import { Order } from '@/types/order';
import { CheckCircle, Truck, MapPin, Clock, PrinterIcon } from 'lucide-react';

interface OrderConfirmationPageProps {
  params: {
    orderId: string;
  };
}

export default function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.orderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setOrder(data.order);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params.orderId]);

  if (isLoading) {
    return (
      <PrivateRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </PrivateRoute>
    );
  }

  if (!order) {
    return (
      <PrivateRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <p className="text-gray-600">Order not found</p>
          </div>
        </div>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Success Message */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Order Confirmed! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
            <p className="text-3xl font-bold text-blue-600">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Order Status Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Order Status</h3>
              </div>
              <p className="text-sm text-gray-600">
                Your order has been confirmed and is being prepared for shipment.
              </p>
              <p className="mt-2 font-bold text-green-600 capitalize">
                ✓ {order.status}
              </p>
            </div>

            {/* Delivery Estimate */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Estimated Delivery</h3>
              </div>
              <p className="text-sm text-gray-600">Expected delivery date</p>
              <p className="mt-2 font-bold text-gray-900">
                {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Total Amount */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
                <h3 className="font-semibold text-gray-900">Total Amount</h3>
              </div>
              <p className="text-sm text-gray-600">Amount paid</p>
              <p className="mt-2 font-bold text-2xl text-green-600">
                ${order.total.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between pb-3 border-b border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{item.image}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Shipping To</h2>
              </div>
              <div className="text-gray-700 space-y-1">
                <p className="font-semibold">
                  {order.shippingAddress.firstName}{' '}
                  {order.shippingAddress.lastName}
                </p>
                <p className="text-sm">{order.shippingAddress.address}</p>
                <p className="text-sm">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                <p className="text-sm">{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Price Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (8%)</span>
                <span className="font-semibold">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">${order.shipping.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl text-blue-600">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              <PrinterIcon className="w-4 h-4" />
              Print Receipt
            </button>
            <Link
              href="/products"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">📧 Confirmation Email</h3>
            <p className="text-blue-800 text-sm mb-3">
              A confirmation email has been sent to{' '}
              <span className="font-bold">{order.shippingAddress.email}</span>
            </p>
            <p className="text-blue-800 text-sm">
              You can track your order status anytime from your dashboard.
            </p>
          </div>
        </main>
      </div>
    </PrivateRoute>
  );
}