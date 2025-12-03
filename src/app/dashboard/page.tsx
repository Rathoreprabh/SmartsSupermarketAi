'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PrivateRoute from '@/components/auth/PrivateRoute';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, TrendingUp, Heart, Package, Loader, Sparkles } from 'lucide-react';

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  completedOrders: number;
}

interface RecentOrder {
  id: string;
  created_at: string;
  total: string;
  status: string;
  order_items: Array<{
    quantity: number;
    products: {
      name: string;
      image: string;
    };
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [aiMealCount, setAiMealCount] = useState(0);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData: User = JSON.parse(storedUser);
      setUserName(userData.fullName);
    }

    // Get cart count
    const cart = localStorage.getItem('cart');
    if (cart) {
      const cartItems = JSON.parse(cart);
      setCartItemCount(cartItems.length);
    }

    // Load dashboard data
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Fetch order statistics
      const statsResponse = await fetch('/api/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Fetch recent orders
      const ordersResponse = await fetch('/api/dashboard/recent-orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.orders);
      }

      // Fetch AI meal count
      const mealsResponse = await fetch('/api/ai/meals', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (mealsResponse.ok) {
        const mealsData = await mealsResponse.json();
        setAiMealCount(mealsData.meals?.length || 0);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      case 'shipped':
      case 'in transit':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (authLoading || isLoading) {
    return (
      <PrivateRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-gray-600">Loading your dashboard...</p>
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
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {userName || 'User'}! 👋
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your supermarket today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total Orders */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalOrders}
                  </p>
                  <p className="text-green-600 text-sm mt-2">
                    {stats.completedOrders} completed
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Spent */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    ${stats.totalSpent.toFixed(2)}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">All time</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* AI Meal Plans */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">AI Meal Plans</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {aiMealCount}
                  </p>
                  <p className="text-purple-600 text-sm mt-2">Saved recipes</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pending Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.pendingOrders}
                  </p>
                  <p className="text-orange-600 text-sm mt-2">In progress</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <button
              onClick={() => router.push('/products')}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-left group"
            >
              <div className="text-3xl mb-2">🛍️</div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                Browse Products
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Explore our wide selection
              </p>
            </button>

            <button
              onClick={() => router.push('/cart')}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-left group"
            >
              <div className="text-3xl mb-2">🛒</div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                View Cart
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {cartItemCount > 0 
                  ? `${cartItemCount} item${cartItemCount !== 1 ? 's' : ''} in cart`
                  : 'Cart is empty'}
              </p>
            </button>

            <button
              onClick={() => router.push('/meal-planner')}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow p-6 hover:shadow-lg transition text-left group border-2 border-purple-200"
            >
              <div className="text-3xl mb-2">✨</div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition">
                AI Meal Planner
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Get personalized recipes
              </p>
            </button>

            <button
              onClick={() => router.push('/orders')}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-left group"
            >
              <div className="text-3xl mb-2">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                Your Orders
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Track order status
              </p>
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            </div>

            {recentOrders.length > 0 ? (
              <>
                <div className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => router.push(`/orders/${order.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                          {order.order_items.slice(0, 3).map((item, idx) => (
                            <div
                              key={idx}
                              className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-lg"
                            >
                              {item.products?.image || '📦'}
                            </div>
                          ))}
                          {order.order_items.length > 3 && (
                            <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-700">
                              +{order.order_items.length - 3}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Order #{order.id.substring(0, 8).toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.created_at)} • ${parseFloat(order.total).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full capitalize ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => router.push('/orders')}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                  >
                    View All Orders →
                  </button>
                </div>
              </>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start shopping to see your order history here
                </p>
                <button
                  onClick={() => router.push('/products')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Browse Products
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </PrivateRoute>
  );
}