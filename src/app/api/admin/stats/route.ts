import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    // Get total revenue and orders
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('total, created_at')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Calculate total revenue
    const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;
    const totalOrders = orders?.length || 0;

    // Get this month's data
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonthOrders = orders?.filter(order => 
      new Date(order.created_at) >= firstDayOfMonth
    ) || [];
    
    const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => 
      sum + parseFloat(order.total), 0
    );

    // Get active users count
    const { count: usersCount, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get products count
    const { count: productsCount, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('in_stock', true);

    // Get revenue trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const revenueTrend = last7Days.map(date => {
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayOrders = orders?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= dayStart && orderDate <= dayEnd;
      }) || [];

      const dayRevenue = dayOrders.reduce((sum, order) => 
        sum + parseFloat(order.total), 0
      );

      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayRevenue,
      };
    });

    // Get top categories
    const { data: products, error: productsDataError } = await supabaseAdmin
      .from('products')
      .select('category');

    const categoryCounts: { [key: string]: number } = {};
    products?.forEach(product => {
      categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    // Get recent orders
    const { data: recentOrders, error: recentOrdersError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        total,
        status,
        created_at,
        user_id,
        users (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        activeUsers: usersCount || 0,
        productsInStock: productsCount || 0,
        thisMonthRevenue,
        thisMonthOrders: thisMonthOrders.length,
        revenueTrend,
        topCategories,
        recentOrders: recentOrders || [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}