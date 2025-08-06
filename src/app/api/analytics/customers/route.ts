import { NextRequest, NextResponse } from 'next/server';
import { assertUserWithTier, UnauthorizedError, ForbiddenError } from '@/lib/authGuard';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Require admin access for analytics
    const user = await assertUserWithTier(request, 'any');
    
    if (user.email !== process.env.ADMIN_EMAIL) {
      throw new ForbiddenError('Admin access required');
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'last_order_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' });

    // Add search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Add sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    const { data: customers, error, count } = await query;

    if (error) {
      throw error;
    }

    // Get customer order history for each customer
    const customerIds = customers?.map(c => c.email) || [];
    const { data: orders } = await supabase
      .from('orders')
      .select('customer_email, amount, status, package_type, created_at')
      .in('customer_email', customerIds)
      .order('created_at', { ascending: false });

    // Group orders by customer
    const ordersByCustomer = (orders || []).reduce((acc, order) => {
      if (!acc[order.customer_email]) {
        acc[order.customer_email] = [];
      }
      acc[order.customer_email].push(order);
      return acc;
    }, {} as Record<string, typeof orders>);

    // Enhance customer data with order details
    const enhancedCustomers = customers?.map(customer => ({
      ...customer,
      orders: ordersByCustomer[customer.email] || [],
      recent_orders: (ordersByCustomer[customer.email] || []).slice(0, 3),
      favorite_package: getMostFrequentPackage(ordersByCustomer[customer.email] || []),
      customer_lifetime_value: customer.total_spent,
      days_since_last_order: customer.last_order_at 
        ? Math.floor((Date.now() - new Date(customer.last_order_at).getTime()) / (1000 * 60 * 60 * 24))
        : null
    }));

    // Calculate customer segments
    const segments = enhancedCustomers?.reduce((acc, customer) => {
      let segment = 'new';
      if (customer.order_count >= 3) segment = 'loyal';
      else if (customer.order_count >= 2) segment = 'returning';
      else if (customer.total_spent > 5000) segment = 'high_value';
      
      acc[segment] = (acc[segment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const response = {
      customers: enhancedCustomers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      segments,
      summary: {
        total_customers: count || 0,
        avg_order_value: enhancedCustomers?.reduce((sum, c) => sum + (c.total_spent / Math.max(c.order_count, 1)), 0) / Math.max(enhancedCustomers?.length || 1, 1),
        avg_orders_per_customer: enhancedCustomers?.reduce((sum, c) => sum + c.order_count, 0) / Math.max(enhancedCustomers?.length || 1, 1),
        total_customer_value: enhancedCustomers?.reduce((sum, c) => sum + c.total_spent, 0) || 0
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error('Customer analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer analytics' },
      { status: 500 }
    );
  }
}

function getMostFrequentPackage(orders: any[]): string | null {
  if (!orders.length) return null;
  
  const packageCounts = orders.reduce((acc, order) => {
    acc[order.package_type] = (acc[order.package_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(packageCounts).reduce((a, b) => packageCounts[a[0]] > packageCounts[b[0]] ? a : b)[0];
}