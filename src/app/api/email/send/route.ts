import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { z } from 'zod';


// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'contact@stratanoble.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@stratanoble.com';

if (SENDGRID_API_KEY) sgMail.setApiKey(SENDGRID_API_KEY);

// Email schemas
const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  topic: z.string().min(1, 'Topic is required'),
  message: z.string().min(1, 'Message is required'),
});

const discoveryFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  businessStage: z.string().min(1, 'Business stage is required'),
  mainChallenge: z.string().min(1, 'Main challenge is required'),
  interestedTier: z.string().min(1, 'Interested tier is required'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;
type DiscoveryFormData = z.infer<typeof discoveryFormSchema>;

// Email templates
const createContactAdminEmail = (data: ContactFormData) => ({
  to: ADMIN_EMAIL,
  from: FROM_EMAIL,
  subject: `New Contact Form Submission: ${data.topic}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #003366;">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
      <p><strong>Topic:</strong> ${data.topic}</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
        ${data.message.replace(/\n/g, '<br>')}
      </div>
      <p style="color: #666; font-size: 12px;">Submitted on ${new Date().toISOString()}</p>
    </div>
  `,
  text: `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Topic: ${data.topic}
Message: ${data.message}

Submitted on ${new Date().toISOString()}
  `,
});

const createContactCustomerEmail = (data: ContactFormData) => ({
  to: data.email,
  from: FROM_EMAIL,
  subject: 'Thank you for contacting Strata Noble',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #003366;">Thank you for reaching out!</h2>
      <p>Hi ${data.name},</p>
      <p>We've received your message about <strong>${data.topic}</strong> and appreciate you taking the time to contact us.</p>
      <p>Our team will review your inquiry and get back to you within 24 hours during business days.</p>
      <p>In the meantime, here's what you can expect:</p>
      <ul>
        <li>Personalized response addressing your specific needs</li>
        <li>Relevant resources or case studies if applicable</li>
        <li>Next steps for moving forward</li>
      </ul>
      <p>If you have any urgent questions, feel free to call us at <strong>702-707-3168</strong>.</p>
      <p>Best regards,<br>The Strata Noble Team</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        This is an automated response. Please do not reply to this email.
      </p>
    </div>
  `,
  text: `
Thank you for reaching out!

Hi ${data.name},

We've received your message about ${data.topic} and appreciate you taking the time to contact us.

Our team will review your inquiry and get back to you within 24 hours during business days.

In the meantime, here's what you can expect:
- Personalized response addressing your specific needs
- Relevant resources or case studies if applicable
- Next steps for moving forward

If you have any urgent questions, feel free to call us at 702-707-3168.

Best regards,
The Strata Noble Team

---
This is an automated response. Please do not reply to this email.
  `,
});

const createDiscoveryAdminEmail = (data: DiscoveryFormData) => ({
  to: ADMIN_EMAIL,
  from: FROM_EMAIL,
  subject: `New Discovery Call Request: ${data.name}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #003366;">New Discovery Call Request</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Business Stage:</strong> ${data.businessStage}</p>
      <p><strong>Main Challenge:</strong> ${data.mainChallenge}</p>
      <p><strong>Interested Tier:</strong> ${data.interestedTier}</p>
      <p style="color: #666; font-size: 12px;">Submitted on ${new Date().toISOString()}</p>
    </div>
  `,
  text: `
New Discovery Call Request

Name: ${data.name}
Email: ${data.email}
Business Stage: ${data.businessStage}
Main Challenge: ${data.mainChallenge}
Interested Tier: ${data.interestedTier}

Submitted on ${new Date().toISOString()}
  `,
});

const createDiscoveryCustomerEmail = (data: DiscoveryFormData) => ({
  to: data.email,
  from: FROM_EMAIL,
  subject: 'Your Discovery Call Request - Next Steps',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #003366;">Discovery Call Request Confirmed!</h2>
      <p>Hi ${data.name},</p>
      <p>Thank you for requesting a discovery call with Strata Noble. We're excited to learn more about your business and how we can help you achieve your goals.</p>
      <p><strong>What happens next:</strong></p>
      <ol>
        <li>Our team will review your information within 2 hours</li>
        <li>You'll receive a personalized Calendly link to schedule your call</li>
        <li>We'll prepare a customized agenda based on your challenges</li>
      </ol>
      <p><strong>Your business details:</strong></p>
      <ul>
        <li>Stage: ${data.businessStage}</li>
        <li>Main Challenge: ${data.mainChallenge}</li>
        <li>Service Interest: ${data.interestedTier}</li>
      </ul>
      <p>If you don't receive your scheduling link within 2 hours, please check your spam folder or call us at <strong>702-707-3168</strong>.</p>
      <p>We look forward to speaking with you!</p>
      <p>Best regards,<br>The Strata Noble Team</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        This is an automated response. Please do not reply to this email.
      </p>
    </div>
  `,
  text: `
Discovery Call Request Confirmed!

Hi ${data.name},

Thank you for requesting a discovery call with Strata Noble. We're excited to learn more about your business and how we can help you achieve your goals.

What happens next:
1. Our team will review your information within 2 hours
2. You'll receive a personalized Calendly link to schedule your call
3. We'll prepare a customized agenda based on your challenges

Your business details:
- Stage: ${data.businessStage}
- Main Challenge: ${data.mainChallenge}
- Service Interest: ${data.interestedTier}

If you don't receive your scheduling link within 2 hours, please check your spam folder or call us at 702-707-3168.

We look forward to speaking with you!

Best regards,
The Strata Noble Team

---
This is an automated response. Please do not reply to this email.
  `,
});

async function handleFormSubmission(formType: string, formData: unknown) {
  if (formType === 'contact') {
    const contactData = contactFormSchema.parse(formData);
    await Promise.all([
      sgMail.send(createContactAdminEmail(contactData)),
      sgMail.send(createContactCustomerEmail(contactData)),
    ]);
    return {
      message: 'Contact form submitted successfully',
      data: {
        customerName: contactData.name,
        customerEmail: contactData.email,
      },
    };
  }

  if (formType === 'discovery') {
    const discoveryData = discoveryFormSchema.parse(formData);
    await Promise.all([
      sgMail.send(createDiscoveryAdminEmail(discoveryData)),
      sgMail.send(createDiscoveryCustomerEmail(discoveryData)),
    ]);
    return {
      message: 'Discovery call request submitted successfully',
      data: {
        customerName: discoveryData.name,
        customerEmail: discoveryData.email,
        interestedTier: discoveryData.interestedTier,
      },
    };
  }

  throw new Error('Invalid form type');
}

export async function POST(request: NextRequest) {
  try {
    if (!SENDGRID_API_KEY) {
      return NextResponse.json({ success: false, error: 'Email service not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { formType, ...formData } = body;

    const result = await handleFormSubmission(formType, formData);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Email API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid form data', details: error.errors }, { status: 400 });
    }

    if (error instanceof Error && error.message === 'Invalid form type') {
      return NextResponse.json({ success: false, error: 'Invalid form type' }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Failed to process email submission' }, { status: 500 });
  }
}
