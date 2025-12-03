import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin (optional - add your admin check here)
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const userEmail = decoded.email;

    console.log('📊 Fetching analytics data...');

    // 1. Get total revenue and orders
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(`
        id, 
        total, 
        status, 
        created_at, 
        user_id,
        users (
          full_name
        )
      `);

    if (ordersError) throw ordersError;

    const totalRevenue = orders?.reduce((sum: number, order: any) => sum + parseFloat(order.total), 0) || 0;
    const totalOrders = orders?.length || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 2. Get total users
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    // 3. Get total products
    const { count: totalProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });

    // 4. Calculate revenue trend (last 7 days)
    const revenueTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = orders?.filter((order: any) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= date && orderDate < nextDate;
      }) || [];

      const dayRevenue = dayOrders.reduce((sum: number, order: any) => sum + parseFloat(order.total), 0);

      revenueTrend.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayRevenue,
        orders: dayOrders.length,
      });
    }

    // 5. Get top products (most sold)
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select(`
        product_id,
        quantity,
        price,
        products (
          id,
          name,
          category
        )
      `);

    if (itemsError) throw itemsError;

    const productStats = new Map();
    orderItems?.forEach((item: any) => {
      if (!item.products) return;
      
      const productId = item.product_id;
      if (productStats.has(productId)) {
        const existing = productStats.get(productId);
        existing.sold += item.quantity;
        existing.revenue += parseFloat(item.price) * item.quantity;
      } else {
        productStats.set(productId, {
          id: productId,
          name: item.products.name || 'Unknown Product',
          category: item.products.category || 'Uncategorized',
          sold: item.quantity,
          revenue: parseFloat(item.price) * item.quantity,
        });
      }
    });

    const topProducts = Array.from(productStats.values())
      .sort((a: any, b: any) => b.sold - a.sold)
      .slice(0, 5);

    // 6. Get category performance
    const categoryStats = new Map();
    orderItems?.forEach((item: any) => {
      if (!item.products) return;
      
      const category = item.products.category || 'Uncategorized';
      const revenue = parseFloat(item.price) * item.quantity;
      
      if (categoryStats.has(category)) {
        const existing = categoryStats.get(category);
        existing.count += item.quantity;
        existing.revenue += revenue;
      } else {
        categoryStats.set(category, {
          name: category,
          count: item.quantity,
          revenue: revenue,
        });
      }
    });

    const topCategories = Array.from(categoryStats.values())
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);

    // 7. Order status breakdown
    const statusBreakdown = new Map();
    orders?.forEach((order: any) => {
      const status = order.status;
      statusBreakdown.set(status, (statusBreakdown.get(status) || 0) + 1);
    });

    const orderStatusBreakdown = Array.from(statusBreakdown.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a: any, b: any) => b.count - a.count);

    // 8. Recent orders (last 10)
    const recentOrders = orders
      ?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map((order: any) => ({
        id: order.id,
        total: order.total,
        created_at: order.created_at,
        user: {
          fullName: order.users?.full_name || 'Unknown Customer',
        },
      })) || [];

    console.log('✅ Analytics data fetched successfully');

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        avgOrderValue,
        revenueTrend,
        topProducts,
        topCategories,
        orderStatusBreakdown,
        recentOrders,
      },
    });
  } catch (error: any) {
    console.error('❌ Error fetching analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}