import { NextRequest, NextResponse } from 'next/server';
import { deliverAllPackageDeliverables } from '@/lib/deliverables';

export async function POST(request: NextRequest) {
  try {
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
    // console.error('Deliverable delivery error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 