import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    console.log('📦 Creating order...');

    const {
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      tax,
      shipping,
      total,
    } = await request.json();

    console.log('📝 Order data:', { 
      itemCount: items?.length, 
      total, 
      hasShippingAddress: !!shippingAddress 
    });

    // Get user from token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.error('❌ No authorization token');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Decode token
    let userId: string;
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      userId = decoded.userId;
      console.log('✅ User ID:', userId);
    } catch (error) {
      console.error('❌ Invalid token:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in order' },
        { status: 400 }
      );
    }

    // Create order
    console.log('💾 Creating order in database...');
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        subtotal: subtotal || 0,
        tax: tax || 0,
        shipping: shipping || 0,
        total: total,
        payment_method: paymentMethod || 'credit-card',
        status: 'pending',
        delivery_address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}`,
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order: ' + orderError.message },
        { status: 500 }
      );
    }

    console.log('✅ Order created:', order.id);

    // Create order items
    console.log('💾 Creating order items...');
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Order items error:', itemsError);
      // Rollback: delete order
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to add order items: ' + itemsError.message },
        { status: 500 }
      );
    }

    console.log('✅ Order items created');

    // Create shipping address
    console.log('💾 Creating shipping address...');
    const { error: addressError } = await supabaseAdmin
      .from('shipping_addresses')
      .insert({
        order_id: order.id,
        first_name: shippingAddress.firstName,
        last_name: shippingAddress.lastName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state || '',
        zip_code: shippingAddress.zipCode,
        country: shippingAddress.country,
      });

    if (addressError) {
      console.error('❌ Shipping address error:', addressError);
      // Don't fail the whole order, just log it
      console.warn('⚠️ Continuing without shipping address record');
    } else {
      console.log('✅ Shipping address created');
    }

// Update product stock
console.log('📦 Updating product stock...');
for (const item of items) {
  // First, get current stock
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('stock_quantity')
    .eq('id', item.id)
    .single();

  if (product) {
    const newStock = product.stock_quantity - item.quantity;
    
    // Update stock
    const { error: stockError } = await supabaseAdmin
      .from('products')
      .update({
        stock_quantity: newStock >= 0 ? newStock : 0,
        in_stock: newStock > 0
      })
      .eq('id', item.id);

    if (stockError) {
      console.error('⚠️ Stock update error for product:', item.id, stockError);
    } else {
      console.log(`✅ Updated stock for ${item.id}: ${product.stock_quantity} → ${newStock}`);
    }
  }
}

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

    console.log('✅ Order completed successfully!');

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        order: {
          id: order.id,
          items,
          shippingAddress,
          subtotal,
          tax,
          shipping,
          total,
          paymentMethod,
          status: 'pending',
          createdAt: order.created_at,
          estimatedDelivery: estimatedDelivery.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order: ' + error.message },
      { status: 500 }
    );
  }
}