import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch order from Supabase
    const { data: order, error } = await supabaseAdmin
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
          id,
          quantity,
          price,
          product_id,
          products (
            name,
            image,
            description
          )
        ),
        shipping_addresses (
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state,
          zip_code,
          country
        )
      `)
      .eq('id', params.orderId)
      .single();

    if (error || !order) {
      console.error('Error fetching order:', error);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Calculate estimated delivery (3 days from order date)
    const estimatedDelivery = new Date(order.created_at);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

    return NextResponse.json(
      {
        order: {
          ...order,
          estimatedDelivery: estimatedDelivery.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { status } = await request.json();

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', params.orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, order: data },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
