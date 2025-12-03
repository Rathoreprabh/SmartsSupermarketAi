import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateMealSuggestions } from '@/lib/cohere/client';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Decode token to get user ID
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const userId = decoded.userId;

    // Get request body
    const body = await request.json();
    const {
      dietaryRestrictions,
      favoriteCuisines,
      allergies,
      dislikedIngredients,
      mealType,
      caloriePreference,
      numberOfMeals,
      prepTimeMax,
      skillLevel,
    } = body;

    console.log('🤖 Generating meal suggestions for user:', userId);

    // Generate meals using Cohere
    const generatedMeals = await generateMealSuggestions({
      dietaryRestrictions,
      favoriteCuisines,
      allergies,
      dislikedIngredients,
      mealType,
      caloriePreference,
      numberOfMeals,
      prepTimeMax,
      skillLevel,
    });

    console.log('✅ Generated', generatedMeals.length, 'meals');

    // Save meals to database
    const savedMeals = [];

    for (const meal of generatedMeals) {
      // Insert meal
      const { data: savedMeal, error: mealError } = await supabaseAdmin
        .from('ai_meals')
        .insert({
          user_id: userId,
          meal_name: meal.mealName,
          description: meal.description,
          cuisine_type: meal.cuisineType,
          meal_type: meal.mealType,
          preparation_time: meal.preparationTime,
          servings: meal.servings,
          calories: meal.calories,
          difficulty_level: meal.difficultyLevel,
          recipe_steps: meal.recipeSteps,
          dietary_tags: meal.dietaryTags,
          ai_generated: true,
        })
        .select()
        .single();

      if (mealError) {
        console.error('Error saving meal:', mealError);
        continue;
      }

      // Match ingredients to products
      for (const ingredient of meal.ingredients) {
        // Try to find matching product
        const { data: products } = await supabaseAdmin
          .from('products')
          .select('id, name')
          .ilike('name', `%${ingredient.name}%`)
          .limit(1);

        const productId = products && products.length > 0 ? products[0].id : null;

        // Insert ingredient
        await supabaseAdmin.from('meal_ingredients').insert({
          meal_id: savedMeal.id,
          ingredient_name: ingredient.name,
          quantity: ingredient.quantity,
          product_id: productId,
        });
      }

      savedMeals.push({
        ...savedMeal,
        ingredients: meal.ingredients,
      });
    }

    return NextResponse.json({
      success: true,
      meals: savedMeals,
    });
  } catch (error: any) {
    console.error('Error generating meals:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate meals' },
      { status: 500 }
    );
  }
}