import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { searchProductImage } from '@/lib/unsplash/client';

export async function POST(request: NextRequest) {
  try {
    // Get all products without real images (emojis only)
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, name, image')
      .not('image', 'like', 'http%');

    if (error) throw error;

    let updated = 0;
    let failed = 0;

    for (const product of products || []) {
      const imageUrl = await searchProductImage(product.name);
      
      if (imageUrl) {
        await supabaseAdmin
          .from('products')
          .update({ image: imageUrl })
          .eq('id', product.id);
        updated++;
      } else {
        failed++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updated} products, ${failed} failed`,
      updated,
      failed,
      total: products?.length || 0,
    });
  } catch (error: any) {
    console.error('Bulk update error:', error);
    return NextResponse.json(
      { error: 'Failed to bulk update' },
      { status: 500 }
    );
  }
}