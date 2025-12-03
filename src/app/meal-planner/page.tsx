'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PrivateRoute from '@/components/auth/PrivateRoute';
import Navbar from '@/components/layout/Navbar';
import {
  Loader,
  Sparkles,
  ChefHat,
  Clock,
  Users,
  Flame,
  ShoppingCart,
  Star,
  Heart,
  X,
  BookOpen,
  Calendar,
} from 'lucide-react';

interface Meal {
  id: string;
  meal_name: string;
  description: string;
  cuisine_type: string;
  meal_type: string;
  preparation_time: number;
  servings: number;
  calories: number;
  difficulty_level: string;
  recipe_steps: string[];
  dietary_tags: string[];
  created_at: string;
  meal_ingredients: Array<{
    ingredient_name: string;
    quantity: string;
    products?: {
      id: string;
      name: string;
      price: number;
      image: string;
      in_stock: boolean;
    };
  }>;
  meal_ratings?: Array<{
    rating: number;
    would_make_again: boolean;
  }>;
}

export default function MealPlannerPage() {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [newMeals, setNewMeals] = useState<Meal[]>([]);
  const [preferences, setPreferences] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMeals, setSelectedMeals] = useState<Set<string>>(new Set());
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedMealForRecipe, setSelectedMealForRecipe] = useState<Meal | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    dietaryRestrictions: [] as string[],
    favoriteCuisines: [] as string[],
    allergies: [] as string[],
    dislikedIngredients: [] as string[],
    mealType: 'dinner',
    caloriePreference: 'medium',
    numberOfMeals: 3,
    prepTimeMax: 60,
    skillLevel: 'intermediate',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Load preferences
      const prefResponse = await fetch('/api/ai/preferences', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const prefData = await prefResponse.json();
      if (prefData.success && prefData.preferences) {
        setPreferences(prefData.preferences);
        setFormData(prev => ({
          ...prev,
          dietaryRestrictions: prefData.preferences.dietary_restrictions || [],
          favoriteCuisines: prefData.preferences.favorite_cuisines || [],
          allergies: prefData.preferences.allergies || [],
          dislikedIngredients: prefData.preferences.disliked_ingredients || [],
          caloriePreference: prefData.preferences.calorie_preference || 'medium',
        }));
      }

      // Load existing meals
      const mealsResponse = await fetch('/api/ai/meals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mealsData = await mealsResponse.json();
      if (mealsData.success) {
        setMeals(mealsData.meals);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMeals = async () => {
    setIsGenerating(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/ai/meals/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Set new meals separately
        setNewMeals(data.meals);
        // Also add to main meals list
        setMeals(prev => [...data.meals, ...prev]);
        setShowPreferences(false);
        
        // Scroll to new meals section
        setTimeout(() => {
          document.getElementById('new-meals-section')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      } else {
        alert(data.error || 'Failed to generate meals');
      }
    } catch (error) {
      console.error('Error generating meals:', error);
      alert('Failed to generate meals');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateGroceryList = async () => {
    if (selectedMeals.size === 0) {
      alert('Please select at least one meal');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/ai/grocery-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mealIds: Array.from(selectedMeals),
          listName: 'My Meal Plan',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add grocery items to cart
        const groceryList = data.groceryList;
        const cartItems = groceryList.grocery_list_items
          .filter((item: any) => item.products && item.products.in_stock)
          .map((item: any) => ({
            id: item.products.id,
            name: item.products.name,
            price: item.products.price,
            image: item.products.image,
            category: item.products.category || 'Grocery',
            quantity: 1,
            description: item.products.description || '',
            in_stock: item.products.in_stock,
          }));

        // Get existing cart
        const existingCart = localStorage.getItem('cart');
        const currentCart = existingCart ? JSON.parse(existingCart) : [];

        // Merge with existing cart (avoid duplicates)
        const mergedCart = [...currentCart];
        cartItems.forEach((newItem: any) => {
          const existingIndex = mergedCart.findIndex((item: any) => item.id === newItem.id);
          if (existingIndex >= 0) {
            mergedCart[existingIndex].quantity += 1;
          } else {
            mergedCart.push(newItem);
          }
        });

        localStorage.setItem('cart', JSON.stringify(mergedCart));

        const addedCount = cartItems.length;
        const skippedCount = groceryList.grocery_list_items.length - addedCount;
        
        let message = `✅ Added ${addedCount} item${addedCount !== 1 ? 's' : ''} to cart!`;
        if (skippedCount > 0) {
          message += `\n⚠️ ${skippedCount} ingredient${skippedCount !== 1 ? 's' : ''} not available in store.`;
        }
        
        alert(message);
        router.push('/cart');
      } else {
        alert(data.error || 'Failed to create grocery list');
      }
    } catch (error) {
      console.error('Error creating grocery list:', error);
      alert('Failed to create grocery list');
    }
  };

  const toggleMealSelection = (mealId: string) => {
    const newSelected = new Set(selectedMeals);
    if (newSelected.has(mealId)) {
      newSelected.delete(mealId);
    } else {
      newSelected.add(mealId);
    }
    setSelectedMeals(newSelected);
  };

  const handleArrayInput = (field: keyof typeof formData, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Generated today';
    if (diffDays === 1) return 'Generated yesterday';
    if (diffDays < 7) return `Generated ${diffDays} days ago`;
    return `Generated on ${date.toLocaleDateString()}`;
  };

  const isNewMeal = (meal: Meal): boolean => {
    return newMeals.some((m: Meal) => m.id === meal.id);
  };

  const oldMeals: Meal[] = meals.filter((meal: Meal) => !isNewMeal(meal));

  // Render Meal Card Component
  const MealCard = ({ meal, isNew }: { meal: Meal; isNew: boolean }) => (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition ${
        selectedMeals.has(meal.id) ? 'ring-4 ring-purple-500' : ''
      } relative`}
    >
      {/* New Badge */}
      {isNew && (
        <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg">
          ✨ NEW
        </div>
      )}

      {/* Meal Header */}
      <div
        className="p-6 border-b border-gray-200 cursor-pointer"
        onClick={() => toggleMealSelection(meal.id)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {meal.meal_name}
            </h3>
            <p className="text-sm text-gray-600">{meal.description}</p>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(meal.created_at)}
            </p>
          </div>
          {selectedMeals.has(meal.id) && (
            <div className="ml-2 p-2 bg-purple-100 rounded-full">
              <Heart className="w-5 h-5 text-purple-600 fill-purple-600" />
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
            {meal.cuisine_type}
          </span>
          {meal.dietary_tags?.slice(0, 2).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Info Row */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {meal.preparation_time} min
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {meal.servings} servings
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4" />
            {meal.calories} cal
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Ingredients:</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {meal.meal_ingredients?.slice(0, 5).map((ing, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{ing.ingredient_name}</span>
              <span className="text-gray-500">{ing.quantity}</span>
            </div>
          ))}
          {meal.meal_ingredients?.length > 5 && (
            <p className="text-xs text-gray-500 italic">
              +{meal.meal_ingredients.length - 5} more ingredients
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">
            Difficulty: <span className="capitalize">{meal.difficulty_level}</span>
          </span>
          {meal.meal_ratings && meal.meal_ratings.length > 0 && (
            <div className="flex items-center gap-1 ml-3">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold">{meal.meal_ratings[0].rating}/5</span>
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedMealForRecipe(meal);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Recipe
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <PrivateRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-gray-600">Loading meal planner...</p>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <Sparkles className="w-10 h-10 text-purple-600" />
                  AI Meal Planner
                </h1>
                <p className="text-gray-600">
                  Get personalized meal suggestions powered by AI
                </p>
              </div>
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold flex items-center gap-2"
              >
                <ChefHat className="w-5 h-5" />
                {showPreferences ? 'Hide Preferences' : 'Set Preferences'}
              </button>
            </div>
          </div>

          {/* Preferences Panel */}
          {showPreferences && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Your Meal Preferences
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dietary Restrictions */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dietary Restrictions (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.dietaryRestrictions.join(', ')}
                    onChange={(e) => handleArrayInput('dietaryRestrictions', e.target.value)}
                    placeholder="vegetarian, vegan, keto, gluten-free"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Favorite Cuisines */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Favorite Cuisines (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.favoriteCuisines.join(', ')}
                    onChange={(e) => handleArrayInput('favoriteCuisines', e.target.value)}
                    placeholder="Italian, Mexican, Thai, Indian"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Allergies */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Allergies (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.allergies.join(', ')}
                    onChange={(e) => handleArrayInput('allergies', e.target.value)}
                    placeholder="nuts, dairy, shellfish"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Disliked Ingredients */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Disliked Ingredients (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.dislikedIngredients.join(', ')}
                    onChange={(e) => handleArrayInput('dislikedIngredients', e.target.value)}
                    placeholder="mushrooms, cilantro, olives"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Meal Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meal Type
                  </label>
                  <select
                    value={formData.mealType}
                    onChange={(e) => setFormData(prev => ({ ...prev, mealType: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                {/* Number of Meals */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Suggestions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.numberOfMeals}
                    onChange={(e) => setFormData(prev => ({ ...prev, numberOfMeals: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Max Prep Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Prep Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    step="15"
                    value={formData.prepTimeMax}
                    onChange={(e) => setFormData(prev => ({ ...prev, prepTimeMax: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Calorie Preference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Calorie Level
                  </label>
                  <select
                    value={formData.caloriePreference}
                    onChange={(e) => setFormData(prev => ({ ...prev, caloriePreference: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low (300-500 cal)</option>
                    <option value="medium">Medium (500-700 cal)</option>
                    <option value="high">High (700+ cal)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleGenerateMeals}
                  disabled={isGenerating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate AI Meal Suggestions
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Selected Meals Actions */}
          {selectedMeals.size > 0 && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md p-4 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {selectedMeals.size} meal{selectedMeals.size !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-sm opacity-90">
                    Ready to create your grocery list
                  </p>
                </div>
                <button
                  onClick={handleCreateGroceryList}
                  className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Create Grocery List
                </button>
              </div>
            </div>
          )}

          {/* New Meals Section */}
          {newMeals.length > 0 && (
            <div id="new-meals-section" className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gradient-to-r from-purple-600 to-pink-600"></div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Newly Generated Meals
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-pink-600 to-purple-600"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newMeals.map((meal: Meal) => (
                  <MealCard key={meal.id} meal={meal} isNew={true} />
                ))}
              </div>
            </div>
          )}

          {/* Old Meals Section */}
          {oldMeals.length > 0 && (
            <div>
              {newMeals.length > 0 && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
                    <ChefHat className="w-6 h-6 text-gray-500" />
                    Previously Generated Meals
                  </h2>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {oldMeals.map((meal: Meal) => (
                  <MealCard key={meal.id} meal={meal} isNew={false} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {meals.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Meal Suggestions Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Click "Set Preferences" to generate AI-powered meal suggestions!
              </p>
            </div>
          )}
        </main>

        {/* Recipe Modal */}
        {selectedMealForRecipe && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  {selectedMealForRecipe.meal_name}
                </h2>
                <button
                  onClick={() => setSelectedMealForRecipe(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Meal Info */}
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">{selectedMealForRecipe.description}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full">
                      {selectedMealForRecipe.cuisine_type}
                    </span>
                    {selectedMealForRecipe.dietary_tags?.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <Clock className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedMealForRecipe.preparation_time} min
                      </p>
                      <p className="text-xs text-gray-600">Prep Time</p>
                    </div>
                    <div className="text-center">
                      <Users className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedMealForRecipe.servings}
                      </p>
                      <p className="text-xs text-gray-600">Servings</p>
                    </div>
                    <div className="text-center">
                      <Flame className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedMealForRecipe.calories}
                      </p>
                      <p className="text-xs text-gray-600">Calories</p>
                    </div>
                    <div className="text-center">
                      <ChefHat className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                      <p className="text-sm font-semibold text-gray-900 capitalize">
                        {selectedMealForRecipe.difficulty_level}
                      </p>
                      <p className="text-xs text-gray-600">Difficulty</p>
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    🛒 Ingredients
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {selectedMealForRecipe.meal_ingredients?.map((ing, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                              {i + 1}
                            </div>
                            <span className="text-gray-900 font-medium">
                              {ing.ingredient_name}
                            </span>
                          </div>
                          <span className="text-gray-600 font-semibold">{ing.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recipe Steps */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    👨‍🍳 Instructions
                  </h3>
                  <div className="space-y-4">
                    {selectedMealForRecipe.recipe_steps?.map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center font-bold">
                          {i + 1}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-gray-700 leading-relaxed">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => {
                      toggleMealSelection(selectedMealForRecipe.id);
                      setSelectedMealForRecipe(null);
                    }}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                      selectedMeals.has(selectedMealForRecipe.id)
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${selectedMeals.has(selectedMealForRecipe.id) ? 'fill-red-700' : ''}`} />
                    {selectedMeals.has(selectedMealForRecipe.id) ? 'Remove from Selection' : 'Add to Selection'}
                  </button>
                  <button
                    onClick={() => setSelectedMealForRecipe(null)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PrivateRoute>
  );
}