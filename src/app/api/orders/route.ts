import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        total,
        subtotal,
        tax,
        shipping,
        status,
        payment_method,
        created_at,
        user_id,
        users (
          full_name,
          email
        ),
        order_items (
          quantity,
          price,
          product_id
        ),
        shipping_addresses (
          first_name,
          last_name,
          address,
          city,
          state,
          zip_code,
          country
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}