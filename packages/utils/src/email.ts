import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { db } from './supabase';
import pino from 'pino';

const logger = pino();

// Initialize AWS SES
const AWS_REGION = process.env.STRATANOBLE_AWS_REGION || process.env.AWS_REGION || 'us-east-1';
const AWS_ACCESS_KEY_ID = process.env.STRATANOBLE_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.STRATANOBLE_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SES_SECRET;
const fromEmail = process.env.SES_FROM_EMAIL || 'no-reply@stratanoble.com';

let sesClient: SESv2Client | null = null;
if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
  sesClient = new SESv2Client({
    region: AWS_REGION,
    credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY },
  });
} else {
  logger.warn('AWS SES credentials not configured. Email functionality will be disabled.');
}

// Email template types
export type EmailTemplate = 
  | 'contact-form-notification'
  | 'contact-form-confirmation'
  | 'order-kickoff'
  | 'order-confirmation'
  | 'welcome'
  | 'idea-validation-welcome'
  | 'roadmap-delivery'
  | 'playbook-activation'
  | 'weekly-checkin'
  | 'revenue-celebration'
  | 'monthly-insights'
  | 're-engagement';

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
    if (!sesClient) {
      logger.warn('Attempted to send email but SES client is not configured');
      await db.logEmail({
        recipient: data.to,
        subject: data.subject,
        template: data.template,
        status: 'failed',
        error_message: 'SES client not configured',
        metadata: data.metadata,
      });
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const command = new SendEmailCommand({
        Destination: {
          ToAddresses: [data.to],
        },
        Content: {
          Simple: {
            Body: {
              Html: {
                Charset: 'UTF-8',
                Data: data.html,
              },
              Text: {
                Charset: 'UTF-8',
                Data: data.text || data.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
              },
            },
            Subject: {
              Charset: 'UTF-8',
              Data: data.subject,
            },
          },
        },
        FromEmailAddress: fromEmail,
      });

      const response = await sesClient.send(command);
      
      await db.logEmail({
        recipient: data.to,
        subject: data.subject,
        template: data.template,
        status: 'sent',
        metadata: {
          ...data.metadata,
          ses_message_id: response.MessageId,
        },
      });

      logger.info({
        msg: 'Email sent successfully',
        recipient: data.to,
        template: data.template,
        messageId: response.MessageId,
      });

      return { success: true, messageId: response.MessageId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await db.logEmail({
        recipient: data.to,
        subject: data.subject,
        template: data.template,
        status: 'failed',
        error_message: errorMessage,
        metadata: data.metadata,
      });

      logger.error({
        msg: 'Failed to send email via AWS SES',
        error: errorMessage,
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
              <a href="tel:702-707-3168" style="color: #047857; text-decoration: none;">702-707-3168</a>
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
          <p>Â© 2024 Strata Noble. All rights reserved.</p>
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
            <a href="https://calendly.com/stratanoble/discovery" 
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
              <a href="tel:702-707-3168" style="color: #047857; text-decoration: none;">702-707-3168</a>
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
          <p>Â© 2024 Strata Noble. All rights reserved.</p>
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
  async sendIdeaValidationWelcome(data: {
    name: string;
    email: string;
    worksheetUrl: string;
  }) {
    const subject = "Welcome to Strata Noble - Let's Turn Your Idea Into Income! 🚀";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #003366 0%, #047857 100%); color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Welcome, ${data.name}! 👋</h1>
          <p style="margin: 10px 0 0; font-size: 18px;">You're about to do something amazing.</p>
        </div>
        
        <div style="padding: 30px 20px; background: white;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Every successful business starts with a single idea — and you've already taken the first step by joining us.
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #047857;">
            <h3 style="color: #003366; margin-top: 0;">Your Next Step: Validate Your Idea</h3>
            <p style="color: #666;">We've created a simple worksheet to help you clarify your vision and test if your idea is ready for the market.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${data.worksheetUrl}" style="display: inline-block; background: #047857; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Get Your Idea Validation Worksheet
              </a>
            </div>
          </div>

          <p style="color: #666; font-size: 14px; font-style: italic;">
            We'll check in with you in 48 hours to see how it's going. You've got this! 💪
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: data.email,
      subject,
      html,
      template: 'idea-validation-welcome',
      metadata: { customerName: data.name },
    });
  }

  async sendRoadmapDelivery(data: {
    name: string;
    email: string;
    roadmapPdfUrl: string;
    readinessScore: number;
    quickWins: string[];
  }) {
    const subject = `Your Business Roadmap is Ready! (${data.readinessScore}% Ready to Launch)`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #003366;">Great News, ${data.name}! 📊</h2>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="font-size: 18px; color: #047857; margin: 0;">Your Business Readiness Score:</p>
          <p style="font-size: 48px; font-weight: bold; color: #003366; margin: 10px 0;">${data.readinessScore}%</p>
        </div>

        <p style="color: #333;">We've analyzed your diagnostic results and created a personalized roadmap just for you.</p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #003366; margin-top: 0;">Your Top 3 Quick Wins:</h3>
          <ol style="color: #666; line-height: 1.8;">
            ${data.quickWins.map(win => `<li>${win}</li>`).join('')}
          </ol>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.roadmapPdfUrl}" style="display: inline-block; background: #003366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Download Your Roadmap (PDF)
          </a>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: data.email,
      subject,
      html,
      template: 'roadmap-delivery',
      metadata: { customerName: data.name, readinessScore: data.readinessScore },
    });
  }

  async sendWeeklyCheckIn(data: {
    name: string;
    email: string;
    tasksCompleted: number;
    totalTasks: number;
    dashboardUrl: string;
  }) {
    const completionRate = Math.round((data.tasksCompleted / data.totalTasks) * 100);
    const subject = `Weekly Check-In: You've Completed ${completionRate}% of Your Goals! 🎯`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #003366;">Hey ${data.name}, Let's Check Your Progress!</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #047857;">This Week's Wins:</h3>
          <p style="font-size: 24px; font-weight: bold; color: #003366;">${data.tasksCompleted} of ${data.totalTasks} tasks completed</p>
          <div style="background: #e8f5e8; height: 10px; border-radius: 5px; overflow: hidden;">
            <div style="background: #047857; height: 100%; width: ${completionRate}%;"></div>
          </div>
        </div>

        ${completionRate < 30 ? `
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;">
              <strong>Feeling stuck?</strong> That's totally normal! Let's get you back on track.
            </p>
            <a href="${data.dashboardUrl}" style="color: #047857;">Book a 15-minute call with us →</a>
          </div>
        ` : `
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #047857;">
            <p style="margin: 0; color: #155724;">
              <strong>You're crushing it!</strong> Keep up the amazing momentum! 🚀
            </p>
          </div>
        `}

        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.dashboardUrl}" style="display: inline-block; background: #003366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px;">
            View Your Dashboard
          </a>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: data.email,
      subject,
      html,
      template: 'weekly-checkin',
      metadata: { customerName: data.name, completionRate },
    });
  }

  async sendRevenueCelebration(data: {
    name: string;
    email: string;
    amount: number;
    slackChannelUrl: string;
  }) {
    const subject = `🎉 You Made Your First Sale! ${(data.amount / 100).toFixed(2)}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #047857 0%, #10b981 100%); color: white; border-radius: 8px;">
          <h1 style="margin: 0; font-size: 32px;">🎊 CONGRATULATIONS! 🎊</h1>
          <p style="font-size: 20px; margin: 20px 0;">You just made your first sale!</p>
          <p style="font-size: 48px; font-weight: bold; margin: 10px 0;">${(data.amount / 100).toFixed(2)}</p>
        </div>
        
        <div style="padding: 30px 20px; background: white;">
          <p style="color: #333; font-size: 18px; text-align: center;">
            ${data.name}, this is HUGE! You've gone from idea to income. 🚀
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #003366;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>✅ You're now a revenue-generating business</li>
              <li>📈 New "Scale" playbooks are now unlocked</li>
              <li>💬 Join our exclusive #achievers Slack channel</li>
              <li>🎤 Share your story (optional case study)</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.slackChannelUrl}" style="display: inline-block; background: #047857; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Join the #achievers Channel
            </a>
          </div>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: data.email,
      subject,
      html,
      template: 'revenue-celebration',
      metadata: { customerName: data.name, amount: data.amount },
    });
  }

  async sendMonthlyInsights(data: {
    name: string;
    email: string;
    insights: string;
    nextPlaybooks: string[];
    dashboardUrl: string;
  }) {
    const subject = `Your Monthly Growth Insights - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #003366;">Hi ${data.name}, Here's What We're Seeing 📈</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #047857;">AI-Generated Insights:</h3>
          <p style="color: #666; line-height: 1.8; white-space: pre-wrap;">${data.insights}</p>
        </div>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #003366;">Recommended Next Steps:</h3>
          <ul style="color: #666; line-height: 1.8;">
            ${data.nextPlaybooks.map(playbook => `<li>${playbook}</li>`).join('')}
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.dashboardUrl}" style="display: inline-block; background: #003366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px;">
            View Full Report
          </a>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: data.email,
      subject,
      html,
      template: 'monthly-insights',
      metadata: { customerName: data.name },
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();

