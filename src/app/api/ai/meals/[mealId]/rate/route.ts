import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: { mealId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const userId = decoded.userId;

    const { rating, feedback, wouldMakeAgain } = await request.json();

    // Upsert rating
    const { data, error } = await supabaseAdmin
      .from('meal_ratings')
      .upsert({
        user_id: userId,
        meal_id: params.mealId,
        rating,
        feedback,
        would_make_again: wouldMakeAgain,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Record in meal history
    await supabaseAdmin.from('user_meal_history').insert({
      user_id: userId,
      meal_id: params.mealId,
      notes: feedback,
    });

    return NextResponse.json({
      success: true,
      rating: data,
    });
  } catch (error: any) {
    console.error('Error rating meal:', error);
    return NextResponse.json(
      { error: 'Failed to rate meal' },
      { status: 500 }
    );
  }
}