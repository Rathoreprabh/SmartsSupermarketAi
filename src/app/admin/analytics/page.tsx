'use client';

import { useEffect, useState } from 'react';
import PrivateRoute from '@/components/auth/PrivateRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { Loader, TrendingUp, DollarSign, ShoppingCart, Package, Users, Calendar } from 'lucide-react';

interface AnalyticsStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  avgOrderValue: number;
  revenueTrend: Array<{
    day: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    category: string;
    sold: number;
    revenue: number;
  }>;
  topCategories: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  orderStatusBreakdown: Array<{
    status: string;
    count: number;
  }>;
  recentOrders: Array<{
    id: string;
    total: string;
    created_at: string;
    user: {
      fullName: string;
    };
  }>;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
    
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      loadAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setError('');
      } else {
        setError(data.error || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PrivateRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-96">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading analytics...</span>
          </div>
        </AdminLayout>
      </PrivateRoute>
    );
  }

  if (error) {
    return (
      <PrivateRoute>
        <AdminLayout>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to Load Analytics
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadAnalytics}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        </AdminLayout>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time insights and statistics</p>
            </div>
            <button
              onClick={loadAnalytics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8" />
                <TrendingUp className="w-5 h-5 opacity-75" />
              </div>
              <p className="text-sm opacity-90 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold">${stats?.totalRevenue.toFixed(2) || '0.00'}</p>
              <p className="text-xs opacity-75 mt-2">All time</p>
            </div>

            {/* Total Orders */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <ShoppingCart className="w-8 h-8" />
                <TrendingUp className="w-5 h-5 opacity-75" />
              </div>
              <p className="text-sm opacity-90 mb-1">Total Orders</p>
              <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
              <p className="text-xs opacity-75 mt-2">Completed orders</p>
            </div>

            {/* Total Users */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8" />
                <TrendingUp className="w-5 h-5 opacity-75" />
              </div>
              <p className="text-sm opacity-90 mb-1">Total Users</p>
              <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
              <p className="text-xs opacity-75 mt-2">Registered customers</p>
            </div>

            {/* Average Order Value */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8" />
                <TrendingUp className="w-5 h-5 opacity-75" />
              </div>
              <p className="text-sm opacity-90 mb-1">Avg Order Value</p>
              <p className="text-3xl font-bold">${stats?.avgOrderValue.toFixed(2) || '0.00'}</p>
              <p className="text-xs opacity-75 mt-2">Per transaction</p>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Revenue Trend (Last 7 Days)</h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            
            {stats?.revenueTrend && stats.revenueTrend.length > 0 ? (
              <div className="flex items-end justify-between h-64 gap-2">
                {stats.revenueTrend.map((data, index) => {
                  const maxRevenue = Math.max(...stats.revenueTrend.map((d) => d.revenue), 1);
                  const height = (data.revenue / maxRevenue) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div className="w-full flex items-end justify-center mb-2 relative" style={{ height: '200px' }}>
                        <div
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                          style={{
                            height: `${height}%`,
                            minHeight: data.revenue > 0 ? '20px' : '0px',
                          }}
                        >
                          {/* Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap transition-opacity">
                            <div className="font-semibold">${data.revenue.toFixed(2)}</div>
                            <div className="text-gray-300">{data.orders} orders</div>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 font-medium">{data.day}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No revenue data available
              </div>
            )}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Top Selling Products</h2>
              {stats?.topProducts && stats.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {stats.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-600">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{product.sold} sold</p>
                        <p className="text-xs text-green-600">${product.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No product data available
                </div>
              )}
            </div>

            {/* Order Status Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
              {stats?.orderStatusBreakdown && stats.orderStatusBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {stats.orderStatusBreakdown.map((status, index) => {
                    const colors = {
                      pending: 'bg-yellow-500',
                      processing: 'bg-blue-500',
                      shipped: 'bg-purple-500',
                      delivered: 'bg-green-500',
                      completed: 'bg-green-600',
                      cancelled: 'bg-red-500',
                    };
                    const color = colors[status.status as keyof typeof colors] || 'bg-gray-500';
                    const total = stats.orderStatusBreakdown.reduce((sum, s) => sum + s.count, 0);
                    const percentage = ((status.count / total) * 100).toFixed(1);

                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700 capitalize">
                            {status.status}
                          </span>
                          <span className="text-sm text-gray-600">
                            {status.count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`${color} h-3 rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No order data available
                </div>
              )}
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Category Performance</h2>
            {stats?.topCategories && stats.topCategories.length > 0 ? (
              <div className="space-y-4">
                {stats.topCategories.map((category, index) => {
                  const maxRevenue = stats.topCategories[0]?.revenue || 1;
                  const percentage = (category.revenue / maxRevenue) * 100;
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">{category.name}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-900">
                            ${category.revenue.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-600 ml-2">
                            ({category.count} products)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No category data available
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h2>
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Order ID
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-mono text-gray-900">
                          #{order.id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {order.user?.fullName || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                          ${parseFloat(order.total).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent orders
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </PrivateRoute>
  );
}