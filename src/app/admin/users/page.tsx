'use client';

import { useState } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Search, Filter, Shield, Eye, Trash2 } from 'lucide-react';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const users = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'customer',
      orders: 12,
      spent: 450.5,
      joinDate: '2024-01-15',
      status: 'active',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'customer',
      orders: 8,
      spent: 320.25,
      joinDate: '2024-02-10',
      status: 'active',
    },
    {
      id: '3',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      orders: 0,
      spent: 0,
      joinDate: '2023-12-01',
      status: 'active',
    },
    {
      id: '4',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      role: 'customer',
      orders: 5,
      spent: 215.75,
      joinDate: '2024-03-20',
      status: 'active',
    },
    {
      id: '5',
      name: 'Alice Brown',
      email: 'alice@example.com',
      role: 'customer',
      orders: 0,
      spent: 0,
      joinDate: '2024-10-15',
      status: 'inactive',
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    if (role === 'admin')
      return 'bg-purple-100 text-purple-800 flex items-center gap-1';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminGuard>
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
          </div>

          {/* Content */}
          <div className="p-6 lg:p-8">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Role Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-end px-4 py-2 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-600">
                    Active Users:{' '}
                    <span className="font-bold text-gray-900">
                      {users.filter((u) => u.status === 'active').length}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Total Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(
                              user.role
                            )}`}
                          >
                            {user.role === 'admin' && (
                              <Shield className="w-3 h-3 inline mr-1" />
                            )}
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {user.orders}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          ${user.spent.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{user.joinDate}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              user.status
                            )}`}
                          >
                            {user.status.charAt(0).toUpperCase() +
                              user.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-blue-100 rounded transition text-blue-600">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-red-100 rounded transition text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* No Results */}
              {filteredUsers.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-gray-600 text-lg">No users found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {filteredUsers.length} of {users.length} users
                </p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition">
                    ← Previous
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    1
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition">
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
