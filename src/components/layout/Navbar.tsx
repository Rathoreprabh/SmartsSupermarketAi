'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut, User, Home, Shield, Sparkles } from 'lucide-react';  // ✅ Add Sparkles import
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check if user is admin - wait for loading to complete
  const isAdmin = !isLoading && user?.email === 'admin@example.com';

  console.log('🔍 NAVBAR DEBUG:');
  console.log('isLoading:', isLoading);
  console.log('user:', user);
  console.log('user?.email:', user?.email);
  console.log('isAdmin:', isAdmin);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-3xl">🛒</span>
            <span className="text-white font-bold text-xl hidden sm:inline">Smart Supermarket</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-white hover:text-blue-100 transition flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/products"
              className="text-white hover:text-blue-100 transition"
            >
              Products
            </Link>
            
            {/* ✅ AI Meal Planner Link - DESKTOP */}
            <Link
              href="/meal-planner"
              className="text-white hover:text-blue-100 transition flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              AI Meals
            </Link>

            <Link
              href="/cart"
              className="text-white hover:text-blue-100 transition"
            >
              Cart
            </Link>

            {/* Admin Link - Only show for admin users */}
            {isLoading ? (
              // While loading, show nothing
              <span className="text-blue-100 text-xs">Loading...</span>
            ) : isAdmin ? (
              // Show admin panel if admin
              <Link
                href="/admin"
                className="text-white hover:text-yellow-100 transition flex items-center gap-1 px-3 py-1 bg-yellow-500 bg-opacity-20 rounded-lg hover:bg-opacity-30 font-semibold"
              >
                <Shield className="w-4 h-4" />
                ⚔️ Admin Panel
              </Link>
            ) : null}

            {/* User Menu */}
            <div className="flex items-center gap-4 border-l border-blue-400 pl-8">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-blue-600">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-white text-sm">{user?.fullName || 'User'}</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-700 px-4 py-4 space-y-2">
          <Link
            href="/dashboard"
            className="block text-white hover:bg-blue-600 px-4 py-2 rounded transition"
          >
            Dashboard
          </Link>
          <Link
            href="/products"
            className="block text-white hover:bg-blue-600 px-4 py-2 rounded transition"
          >
            Products
          </Link>

          {/* ✅ AI Meal Planner Link - MOBILE */}
          <Link
            href="/meal-planner"
            className="block text-white hover:bg-blue-600 px-4 py-2 rounded transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Meal Planner
          </Link>

          <Link
            href="/cart"
            className="block text-white hover:bg-blue-600 px-4 py-2 rounded transition"
          >
            Cart
          </Link>

          {/* Admin Link Mobile */}
          {isLoading ? (
            <div className="px-4 py-2 text-blue-100 text-xs">Loading...</div>
          ) : isAdmin ? (
            <Link
              href="/admin"
              className="block text-white hover:bg-yellow-500 px-4 py-2 rounded transition flex items-center gap-2 bg-yellow-500 bg-opacity-20 font-semibold"
            >
              <Shield className="w-4 h-4" />
              ⚔️ Admin Panel
            </Link>
          ) : null}

          <Link
            href="/profile"
            className="block text-white hover:bg-blue-600 px-4 py-2 rounded transition flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      )}
    </nav>
  );
}