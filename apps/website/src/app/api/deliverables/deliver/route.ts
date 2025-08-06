import { NextRequest, NextResponse } from 'next/server';
import { deliverAllPackageDeliverables } from '@/lib/deliverables';
import { assertUserWithTier, UnauthorizedError, ForbiddenError } from '@/lib/authGuard';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Require authentication - any valid user can deliver packages they own
    const user = await assertUserWithTier(request, 'any');
    
    const body = await request.json();
    const { customerEmail, customerName, packageType } = body;

    // Validate required fields
    if (!customerEmail || !customerName || !packageType) {
      return NextResponse.json(
        { error: 'Missing required fields: customerEmail, customerName, packageType' },
        { status: 400 }
      );
    }

    // Validate package type
    if (!['lite', 'core', 'premium'].includes(packageType)) {
      return NextResponse.json(
        { error: 'Invalid package type. Must be lite, core, or premium' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Verify the user owns this order/has permission to deliver to this customer
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, customer_email, customer_id, status')
      .eq('customer_email', customerEmail)
      .eq('package_type', packageType)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found or access denied' },
        { status: 404 }
      );
    }

    // Check if user is either the customer or an admin
    if (order.customer_id !== user.id && user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only access your own orders' },
        { status: 403 }
      );
    }

    // Check if order is in a valid state for delivery
    if (order.status !== 'paid' && order.status !== 'processing') {
      return NextResponse.json(
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
      return NextResponse.json({
        success: true,
        message: 'All deliverables delivered successfully',
        delivered: result.delivered,
        failed: result.failed
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Some deliverables failed to deliver',
        delivered: result.delivered,
        failed: result.failed
      }, { status: 207 }); // 207 Multi-Status
    }
  } catch (error) {
    // Handle authentication errors specifically
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

    // Log other errors for debugging (in production, use proper logging service)
    console.error('Deliverable delivery error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 