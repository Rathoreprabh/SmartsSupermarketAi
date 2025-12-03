'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PrivateRoute from '@/components/auth/PrivateRoute';
import Navbar from '@/components/layout/Navbar';
import { Loader, Plus, Trash2, Sparkles } from 'lucide-react';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingImage, setIsFetchingImage] = useState(false);
  const [notification, setNotification] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    image: '🛒',
    category: 'Fruits',
    rating: '4.5',
    reviews: '0',
    in_stock: true,
    stock_quantity: '0',
  });

  const categories = ['Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Pantry', 'Beverages', 'Snacks', 'Frozen', 'Meat'];

  // Auto-fetch image when product name changes
  useEffect(() => {
    if (formData.name.length > 3) {
      const timer = setTimeout(() => {
        autoFetchImage(formData.name);
      }, 1500); // Wait 1.5 seconds after user stops typing

      return () => clearTimeout(timer);
    }
  }, [formData.name]);

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch image from Unsplash
  const autoFetchImage = async (productName: string) => {
    if (!productName || productName.length < 3) return;

    setIsFetchingImage(true);

    try {
      console.log('🔍 Auto-fetching image for:', productName);
      
      const response = await fetch('/api/products/search-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: productName,
        }),
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        console.log('✅ Auto-fetched image:', data.imageUrl);
        setFormData(prev => ({ ...prev, image: data.imageUrl }));
      }
    } catch (error) {
      console.error('Error auto-fetching image:', error);
    } finally {
      setIsFetchingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          image: formData.image,
          category: formData.category,
          rating: parseFloat(formData.rating),
          reviews: parseInt(formData.reviews),
          in_stock: formData.in_stock,
          stock_quantity: parseInt(formData.stock_quantity),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNotification('✅ Product added successfully!');
        setShowAddForm(false);
        setFormData({
          name: '',
          description: '',
          price: '',
          original_price: '',
          image: '🛒',
          category: 'Fruits',
          rating: '4.5',
          reviews: '0',
          in_stock: true,
          stock_quantity: '0',
        });
        loadProducts();
        setTimeout(() => setNotification(''), 3000);
      } else {
        setNotification('❌ Failed to add product: ' + data.error);
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setNotification('❌ Error adding product');
      setTimeout(() => setNotification(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setNotification('✅ Product deleted successfully!');
        loadProducts();
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setNotification('❌ Error deleting product');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  if (isLoading) {
    return (
      <PrivateRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-gray-600">Loading...</p>
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Product Management</h1>
              <p className="text-gray-600">Add, edit, and manage your products with auto-image search ✨</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Product
            </button>
          </div>

          {/* Notification */}
          {notification && (
            <div className={`mb-6 p-4 rounded-lg font-semibold ${
              notification.includes('✅') 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {notification}
            </div>
          )}

          {/* Add Product Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Fresh Apples"
                    />
                    {isFetchingImage && (
                      <div className="absolute right-3 top-2.5">
                        <Loader className="w-5 h-5 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isFetchingImage ? (
                      <span className="flex items-center gap-1 text-blue-600">
                        <Sparkles className="w-3 h-3" />
                        Searching for image...
                      </span>
                    ) : (
                      'Image will auto-fetch as you type'
                    )}
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Product description"
                  />
                </div>

                {/* Image Preview */}
                {formData.image && formData.image.startsWith('http') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Auto-Fetched Image Preview ✨
                    </label>
                    <div className="relative inline-block">
                      <img 
                        src={formData.image} 
                        alt="Product preview" 
                        className="w-48 h-48 object-cover rounded-lg border-2 border-green-500 shadow-lg"
                      />
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        ✓ Auto
                      </div>
                    </div>
                  </div>
                )}

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="4.99"
                  />
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Original Price ($) <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5.99"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50"
                  />
                </div>

                {/* In Stock */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={formData.in_stock ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, in_stock: e.target.value === 'true' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">In Stock</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>

                {/* Submit Buttons */}
                <div className="md:col-span-2 flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Adding Product...
                      </>
                    ) : (
                      'Add Product'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image && product.image.startsWith('http') ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-3xl">{product.image}</span>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${product.price.toFixed(2)}
                        {product.original_price && (
                          <span className="ml-2 text-xs text-gray-500 line-through">
                            ${product.original_price.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{product.stock_quantity}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          product.in_stock
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {products.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-md mt-6">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Yet</h3>
              <p className="text-gray-600">Click "Add New Product" to get started</p>
            </div>
          )}
        </main>
      </div>
    </PrivateRoute>
  );
}