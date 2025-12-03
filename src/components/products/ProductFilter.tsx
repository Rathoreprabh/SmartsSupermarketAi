'use client';

import { CATEGORIES } from '@/data/product';
import { X } from 'lucide-react';

interface ProductFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  categories?: string[]; 
}

export default function ProductFilter({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  searchQuery,
  onSearchChange,
  onReset,
}: ProductFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        <button
          onClick={onReset}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Categories */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Category
        </label>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <label key={category} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                value={category}
                checked={selectedCategory === category}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <span className="text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Price Range
        </label>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-600">Min: ${priceRange[0]}</label>
            <input
              type="range"
              min="0"
              max="20"
              value={priceRange[0]}
              onChange={(e) =>
                onPriceChange([Number(e.target.value), priceRange[1]])
              }
              className="w-full accent-blue-600"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Max: ${priceRange[1]}</label>
            <input
              type="range"
              min="0"
              max="20"
              value={priceRange[1]}
              onChange={(e) =>
                onPriceChange([priceRange[0], Number(e.target.value)])
              }
              className="w-full accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Clear Button */}
      <button
        onClick={onReset}
        className="w-full mt-6 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
      >
        Clear All Filters
      </button>
    </div>
  );
}