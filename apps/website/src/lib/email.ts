import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { logger } from './logger';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL || 'info@stratanoble.com';

// Initialize AWS SES client
const sesClient = new SESClient({
  region: AWS_REGION,
  credentials: AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

const fromEmail = SES_FROM_EMAIL;

// Email template types
export type EmailTemplate =
  | 'contact-form-notification'
  | 'contact-form-confirmation'
  | 'order-kickoff'
  | 'order-confirmation'
  | 'welcome'
  | 'early-access-confirmation'
  | 'early-access-notification';

// Email service class
class EmailService {
  private async sendEmail(data: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    template: EmailTemplate;
    metadata?: Record<string, unknown>;
  }) {
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      logger.warn('AWS credentials not configured. Email functionality will be disabled.');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const command = new SendEmailCommand({
        Source: fromEmail,
        Destination: {
          ToAddresses: [data.to],
        },
        Message: {
          Subject: {
            Data: data.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: data.html,
              Charset: 'UTF-8',
            },
            Text: {
              Data: data.text || data.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
              Charset: 'UTF-8',
            },
          },
        },
      });

      const response = await sesClient.send(command);

      logger.info('Email sent successfully via AWS SES', {
        recipient: data.to,
        template: data.template,
        messageId: response.MessageId,
      });

      return { success: true, messageId: response.MessageId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('Failed to send email via AWS SES', error instanceof Error ? error : new Error(errorMessage), {
        recipient: data.to,
        template: data.template,
      });

      return { success: false, error: errorMessage };
    }
  }

  // Contact form notification (to team)
  async sendContactFormNotification(data: {
    name: string;
    email: string;
    phone?: string;
    topic?: string;
    message: string;
    submissionId: string;
  }) {
    const subject = `New Contact Form Submission - ${data.name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #003366;">New Contact Form Submission</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #003366; margin-top: 0;">Contact Details</h3>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          ${data.phone ? `<p><strong>Phone:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>` : ''}
          ${data.topic ? `<p><strong>Topic:</strong> ${data.topic}</p>` : ''}
        </div>

        <div style="background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
          <h3 style="color: #003366; margin-top: 0;">Message</h3>
          <p style="white-space: pre-wrap;">${data.message}</p>
        </div>

        <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>Submission ID:</strong> ${data.submissionId}<br>
            <strong>Submitted:</strong> ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: fromEmail, // Send to team email
      subject,
      html,
      template: 'contact-form-notification',
      metadata: { submissionId: data.submissionId, customerEmail: data.email },
    });
  }

  // Contact form confirmation (to customer)
  async sendContactFormConfirmation(data: {
    name: string;
    email: string;
    message: string;
  }) {
    const subject = 'Thank you for contacting Strata Noble';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #003366 0%, #047857 100%); color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Thank You, ${data.name}!</h1>
        </div>
        
        <div style="padding: 30px 20px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            We've received your message and appreciate you taking the time to reach out to us.
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #047857;">
            <h3 style="color: #003366; margin-top: 0;">What happens next?</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>We'll review your message within 24 hours</li>
              <li>A team member will reach out to discuss your needs</li>
              <li>We'll provide you with a customized solution</li>
            </ul>
          </div>

          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>Your message:</strong><br>
              <em>"${data.message.substring(0, 200)}${data.message.length > 200 ? '...' : ''}"</em>
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666;">
              Questions? Reply to this email or call us at 
              <a href="tel:702-721-3566" style="color: #047857; text-decoration: none;">(702) 721-3566</a>
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
          <p>© 2024 Strata Noble. All rights reserved.</p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: data.email,
      subject,
      html,
      template: 'contact-form-confirmation',
      metadata: { customerName: data.name },
    });
  }

  // Order kickoff email
  async sendOrderKickoffEmail(data: {
    customerName: string;
    customerEmail: string;
    packageType: string;
    orderId: string;
    amount: number;
  }) {
    const packageNames: Record<string, string> = {
      lite: 'Lite Package',
      core: 'Core Package', 
      premium: 'Premium Package',
    };

    const packageName = packageNames[data.packageType] || data.packageType;
    const subject = `Welcome to Strata Noble - Your ${packageName} is Ready!`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #003366 0%, #047857 100%); color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Strata Noble!</h1>
          <p style="margin: 10px 0 0; font-size: 18px; opacity: 0.9;">Your journey to prosperity starts now</p>
        </div>
        
        <div style="padding: 30px 20px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hello ${data.customerName},
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Thank you for choosing our <strong>${packageName}</strong>! We're excited to help you transform your passion into profit.
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #047857;">
            <h3 style="color: #003366; margin-top: 0;">Next Steps</h3>
            <ol style="color: #666; line-height: 1.8;">
              <li><strong>Schedule Your Discovery Call</strong> - Use the link below to book your first session</li>
              <li><strong>Prepare Your Materials</strong> - We'll send you a preparation guide</li>
              <li><strong>Start Your Journey</strong> - Our team will guide you every step of the way</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://calendly.com/contact-stratanoble/30min"
               style="display: inline-block; background: #047857; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Schedule Your Discovery Call
            </a>
          </div>

          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #003366; margin-top: 0;">Order Details</h4>
            <p style="margin: 5px 0; font-size: 14px; color: #666;">
              <strong>Package:</strong> ${packageName}<br>
              <strong>Order ID:</strong> ${data.orderId}<br>
              <strong>Amount:</strong> $${(data.amount / 100).toFixed(2)}
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666;">
              Questions? Reply to this email or call us at 
              <a href="tel:702-721-3566" style="color: #047857; text-decoration: none;">(702) 721-3566</a>
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
          <p>© 2024 Strata Noble. All rights reserved.</p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: data.customerEmail,
      subject,
      html,
      template: 'order-kickoff',
      metadata: { 
        customerName: data.customerName,
        packageType: data.packageType,
        orderId: data.orderId,
        amount: data.amount,
      },
    });
  }

  // Early access confirmation email (to user)
  async sendEarlyAccessConfirmation(data: {
    name: string;
    email: string;
    role?: string;
    goals?: string;
  }) {
    const subject = 'Welcome to ACHIEVERY Early Access - You\'re In!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #001122 0%, #50C878 100%); color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 You're In!</h1>
          <p style="margin: 10px 0 0; font-size: 18px; opacity: 0.9;">Welcome to ACHIEVERY Early Access</p>
        </div>

        <div style="padding: 30px 20px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hi ${data.name},
          </p>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Congratulations! You've successfully joined the exclusive ACHIEVERY early access program.
            You're now among the first to transform your daily activities into recognized professional achievements.
          </p>

          <div style="background: #f0f8f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #50C878;">
            <h3 style="color: #001122; margin-top: 0;">🚀 What You Get as an Early Access Member:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li><strong>50% Off Launch Pricing</strong> - Exclusive founding member discount</li>
              <li><strong>Priority Platform Access</strong> - First to experience ACHIEVERY</li>
              <li><strong>Personal Onboarding</strong> - One-on-one setup with our team</li>
              <li><strong>Direct Feedback Channel</strong> - Help shape the platform</li>
              <li><strong>Founding Member Badge</strong> - Lifetime recognition</li>
            </ul>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #001122; margin-top: 0;">📅 What Happens Next?</h3>
            <ol style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li><strong>Development Updates</strong> - Regular progress reports and sneak peeks</li>
              <li><strong>Beta Testing Invitation</strong> - Try features before anyone else</li>
              <li><strong>Launch Notification</strong> - Priority access when we go live (Q1 2026)</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              Follow our progress and connect with other early access members:
            </p>
            <div style="margin-top: 15px;">
              <a href="https://linkedin.com/company/stratanoble" style="display: inline-block; margin: 0 10px; color: #50C878; text-decoration: none; font-weight: bold;">LinkedIn</a>
              <a href="https://stratanoble.com/achievery-preview" style="display: inline-block; margin: 0 10px; color: #50C878; text-decoration: none; font-weight: bold;">Platform Preview</a>
            </div>
          </div>

          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666; text-align: center;">
              <strong>💡 Pro Tip:</strong> Start thinking about your daily activities that could become achievements.
              When ACHIEVERY launches, you'll be ready to hit the ground running!
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px;">
              Questions about early access?
              <a href="mailto:info@stratanoble.com" style="color: #50C878; text-decoration: none;">info@stratanoble.com</a>
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
          <p>© 2025 Strata Noble. Building ACHIEVERY for ambitious professionals.</p>
          <p>
            <a href="#" style="color: #999; text-decoration: none;">Unsubscribe</a> |
            <a href="https://stratanoble.com/privacy" style="color: #999; text-decoration: none;">Privacy Policy</a>
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: data.email,
      subject,
      html,
      template: 'early-access-confirmation',
      metadata: {
        customerName: data.name,
        role: data.role,
        goals: data.goals,
      },
    });
  }

  // Early access notification email (to team)
  async sendEarlyAccessNotification(data: {
    name: string;
    email: string;
    role?: string;
    goals?: string;
    signupId: string;
  }) {
    const subject = `🚀 New ACHIEVERY Early Access Signup - ${data.name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #001122;">🚀 New ACHIEVERY Early Access Signup</h2>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #001122; margin-top: 0;">Contact Details</h3>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          ${data.role ? `<p><strong>Role:</strong> ${data.role}</p>` : ''}
        </div>

        ${data.goals ? `
        <div style="background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #001122; margin-top: 0;">Professional Growth Challenge</h3>
          <p style="white-space: pre-wrap;">${data.goals}</p>
        </div>
        ` : ''}

        <div style="background: #f0f8f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #50C878;">
          <h3 style="color: #001122; margin-top: 0;">🎯 Follow-up Actions</h3>
          <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Add to early access CRM segment</li>
            <li>Include in development update emails</li>
            <li>Prioritize for beta testing program</li>
            <li>Send launch notification with discount code</li>
          </ul>
        </div>

        <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>Signup ID:</strong> ${data.signupId}<br>
            <strong>Submitted:</strong> ${new Date().toLocaleString()}<br>
            <strong>Source:</strong> ACHIEVERY Early Access Page
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: fromEmail, // Send to team email
      subject,
      html,
      template: 'early-access-notification',
      metadata: {
        signupId: data.signupId,
        customerEmail: data.email,
        customerName: data.name,
        role: data.role
      },
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
