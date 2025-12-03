import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const userId = decoded.userId;

    const { mealIds, listName } = await request.json();

    if (!mealIds || mealIds.length === 0) {
      return NextResponse.json(
        { error: 'No meals selected' },
        { status: 400 }
      );
    }

    // Create grocery list
    const { data: groceryList, error: listError } = await supabaseAdmin
      .from('grocery_lists')
      .insert({
        user_id: userId,
        list_name: listName || 'My Meal Plan',
        created_from_meal_ids: mealIds,
        status: 'active',
      })
      .select()
      .single();

    if (listError) {
      throw listError;
    }

    // Get all ingredients from selected meals
    const { data: ingredients, error: ingredientsError } = await supabaseAdmin
      .from('meal_ingredients')
      .select('*')
      .in('meal_id', mealIds);

    if (ingredientsError) {
      throw ingredientsError;
    }

    // Group and combine similar ingredients
    const ingredientMap = new Map();
    ingredients?.forEach(ing => {
      if (ingredientMap.has(ing.ingredient_name)) {
        const existing = ingredientMap.get(ing.ingredient_name);
        existing.quantity += `, ${ing.quantity}`;
      } else {
        ingredientMap.set(ing.ingredient_name, { ...ing });
      }
    });

    // Insert grocery list items
    const listItems = Array.from(ingredientMap.values()).map(ing => ({
      list_id: groceryList.id,
      product_id: ing.product_id,
      ingredient_name: ing.ingredient_name,
      quantity: ing.quantity,
      checked: false,
    }));

    await supabaseAdmin.from('grocery_list_items').insert(listItems);

// Fetch complete list with products
const { data: completeList } = await supabaseAdmin
  .from('grocery_lists')
  .select(`
    *,
    grocery_list_items (
      *,
      products (
        id,
        name,
        price,
        image,
        in_stock,
        category,
        description
      )
    )
  `)
  .eq('id', groceryList.id)
  .single();

    return NextResponse.json({
      success: true,
      groceryList: completeList,
    });
  } catch (error: any) {
    console.error('Error creating grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to create grocery list' },
      { status: 500 }
    );
  }
}