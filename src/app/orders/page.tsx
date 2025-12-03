'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PrivateRoute from '@/components/auth/PrivateRoute';
import Navbar from '@/components/layout/Navbar';
import { Loader, Package, Calendar, DollarSign, Eye } from 'lucide-react';

interface Order {
  id: string;
  total: string;
  subtotal: string;
  tax: string;
  shipping: string;
  status: string;
  payment_method: string;
  created_at: string;
  order_items: Array<{
    id: string;
    quantity: number;
    price: string;
    products: {
      name: string;
      image: string;
    };
  }>;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      console.log('📦 Fetching orders...');
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('📥 Orders response:', data);

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        console.error('Failed to load orders:', data.error);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'processing':
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'shipped':
        return 'bg-purple-100 text-purple-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const viewOrderDetails = (orderId: string) => {
    router.push(`/cart/checkout/confirmation?orderId=${orderId}`);
  };

  if (isLoading) {
    return (
      <PrivateRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Orders</h1>
            <p className="text-gray-600">Track and manage your orders</p>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Order ID</p>
                          <p className="font-semibold text-gray-900">
                            #{order.id.substring(0, 8).toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Date</p>
                          <p className="font-semibold text-gray-900 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Total</p>
                          <p className="font-semibold text-gray-900 flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {parseFloat(order.total).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        <button
                          onClick={() => viewOrderDetails(order.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">
                        {order.order_items?.length || 0} Item
                        {(order.order_items?.length || 0) !== 1 ? 's' : ''}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.order_items?.slice(0, 3).map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="text-3xl">{item.products?.image || '📦'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {item.products?.name || 'Product'}
                            </p>
                            <p className="text-xs text-gray-600">
                              Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {(order.order_items?.length || 0) > 3 && (
                        <div className="flex items-center justify-center p-3 bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-600 font-semibold">
                            +{(order.order_items?.length || 0) - 3} more
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-6">
                Start shopping to see your orders here
              </p>
              <button
                onClick={() => router.push('/products')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Browse Products
              </button>
            </div>
          )}
        </main>
      </div>
    </PrivateRoute>
  );
}

