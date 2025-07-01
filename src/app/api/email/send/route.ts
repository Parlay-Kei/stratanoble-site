import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // Log the discovery form submission
    // console.log('Discovery form submission received:', {
    //   name: formData.name,
    //   email: formData.email,
    //   businessStage: formData.businessStage,
    //   mainChallenge: formData.mainChallenge,
    //   interestedTier: formData.interestedTier,
    //   timestamp: new Date().toISOString()
    // });

    // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
    // For now, we'll just log the email that should be sent
    
    // Email to admin notification (example structure)
    // const adminEmailContent = { ... };

    // Email to customer confirmation (example structure)
    // const customerEmailContent = { ... };

    // Log what emails would be sent
    // console.log('Admin notification email:', adminEmailContent);
    // console.log('Customer confirmation email:', customerEmailContent);

    // TODO: Actually send emails using your preferred service
    // Example with SendGrid:
    // await sendEmail(adminEmailContent);
    // await sendEmail(customerEmailContent);

    return NextResponse.json({ 
      success: true, 
      message: 'Discovery form submitted successfully',
      data: {
        customerName: formData.name,
        customerEmail: formData.email,
        interestedTier: formData.interestedTier
      }
    });

  } catch (error) {
    // console.error('Error processing discovery form:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process discovery form submission' 
      },
      { status: 500 }
    );
  }
}
