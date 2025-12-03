import Link from 'next/link';
import { ArrowRight, ShoppingCart, Truck, CreditCard } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-white text-2xl font-bold">
          <span>🛒</span>
          <span>Smart Supermarket</span>
        </div>
        <div className="flex gap-4">
          <Link
            href="/auth/login"
            className="text-white hover:text-gray-200 transition font-semibold"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Fresh Groceries, <br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Delivered Fast
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Shop from your favorite stores and get fresh groceries delivered to your door in under 30 minutes.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/register"
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center gap-2 px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-gray-900 transition font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 text-white hover:bg-opacity-20 transition">
            <ShoppingCart className="w-12 h-12 mb-4 text-blue-400" />
            <h3 className="text-xl font-bold mb-2">Easy Shopping</h3>
            <p className="text-gray-300">Browse thousands of products and add them to your cart in seconds.</p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 text-white hover:bg-opacity-20 transition">
            <Truck className="w-12 h-12 mb-4 text-purple-400" />
            <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
            <p className="text-gray-300">Get your groceries delivered to your doorstep in under 30 minutes.</p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 text-white hover:bg-opacity-20 transition">
            <CreditCard className="w-12 h-12 mb-4 text-green-400" />
            <h3 className="text-xl font-bold mb-2">Secure Payment</h3>
            <p className="text-gray-300">Multiple payment options with industry-leading security.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p className="text-xl text-gray-300 mb-8">Join thousands of happy customers and enjoy fresh groceries delivered fast.</p>
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-semibold text-lg"
        >
          Create Your Account <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}