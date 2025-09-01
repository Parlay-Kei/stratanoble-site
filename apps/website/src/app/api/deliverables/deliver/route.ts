import { NextRequest } from 'next/server';
import { deliverAllPackageDeliverables } from '@/lib/deliverables';
import { assertUserWithTier, UnauthorizedError, ForbiddenError } from '@/lib/authGuard';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type Order = Database['public']['Tables']['orders']['Row'];

export async function POST(request: NextRequest) {
  try {
    // Require authentication - any valid user can deliver packages they own
    const user = await assertUserWithTier(request, 'any');
    
    const body = await request.json();
    const { customerEmail, customerName, packageType } = body;

    // Validate required fields
    if (!customerEmail || !customerName || !packageType) {
      return Response.json(
        { error: 'Missing required fields: customerEmail, customerName, packageType' },
        { status: 400 }
      );
    }

    // Validate package type
    if (!['lite', 'core', 'premium'].includes(packageType)) {
      return Response.json(
        { error: 'Invalid package type. Must be lite, core, or premium' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return Response.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Verify the user owns this order/has permission to deliver to this customer
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, customer_email, status')
      .eq('customer_email', customerEmail)
      .eq('package_type', packageType)
      .single();

    if (orderError || !order) {
      return Response.json(
        { error: 'Order not found or access denied' },
        { status: 404 }
      );
    }

    const orderData = order as Order;

    // Check if user is either the customer or an admin
    if (orderData.customer_email !== user.email && user.email !== process.env.ADMIN_EMAIL) {
      return Response.json(
        { error: 'Unauthorized: You can only access your own orders' },
        { status: 403 }
      );
    }

    // Check if order is in a valid state for delivery
    if (orderData.status !== 'paid') {
      return Response.json(
        { error: 'Order not in valid state for delivery' },
        { status: 400 }
      );
    }

    // Deliver all deliverables for the package
    const result = await deliverAllPackageDeliverables(
      customerEmail,
      customerName,
      packageType as 'lite' | 'core' | 'premium'
    );

    if (result.success) {
      return Response.json({
        success: true,
        message: 'All deliverables delivered successfully',
        delivered: result.delivered,
        failed: result.failed
      });
    } else {
      return Response.json({
        success: false,
        message: 'Some deliverables failed to deliver',
        delivered: result.delivered,
        failed: result.failed
      }, { status: 207 }); // 207 Multi-Status
    }
  } catch (error) {
    // Handle authentication errors specifically
    if (error instanceof UnauthorizedError) {
      return Response.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    if (error instanceof ForbiddenError) {
      return Response.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 