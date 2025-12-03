'use client';

import PrivateRoute from '@/components/auth/PrivateRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { Save, Bell, Shield, Palette } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <PrivateRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your admin preferences</p>
          </div>

          {/* General Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Store Name
                </label>
                <input
                  type="text"
                  defaultValue="Smart Supermarket"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Email
                </label>
                <input
                  type="email"
                  defaultValue="admin@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                <span className="text-sm text-gray-700">Email notifications for new orders</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                <span className="text-sm text-gray-700">Low stock alerts</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                <span className="text-sm text-gray-700">Weekly sales report</span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>
      </AdminLayout>
    </PrivateRoute>
  );
}