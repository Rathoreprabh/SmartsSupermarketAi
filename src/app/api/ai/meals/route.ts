import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const userId = decoded.userId;

    // Get meals with ingredients
    const { data: meals, error } = await supabaseAdmin
      .from('ai_meals')
      .select(`
        *,
        meal_ingredients (
          id,
          ingredient_name,
          quantity,
          product_id,
          products (
            id,
            name,
            price,
            image,
            in_stock
          )
        ),
        meal_ratings (
          rating,
          feedback,
          would_make_again
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      meals: meals || [],
    });
  } catch (error: any) {
    console.error('Error fetching meals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meals' },
      { status: 500 }
    );
  }
}