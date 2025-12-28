import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

export interface IntakeNotification {
  source: string;
  name: string;
  email: string;
  businessName: string;
  payload?: Record<string, any>;
}

export async function notifyNewIntake(intake: IntakeNotification): Promise<void> {
  // Skip if credentials not configured
  if (!process.env.SES_FROM_EMAIL || !process.env.NOTIFICATION_EMAIL) {
    console.log('[SES] Notification skipped - credentials not configured');
    return;
  }

  try {
    const emailBody = formatIntakeEmail(intake);

    const command = new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [process.env.NOTIFICATION_EMAIL],
      },
      Message: {
        Subject: {
          Data: `[${intake.source}] New Lead: ${intake.businessName}`,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: emailBody,
            Charset: 'UTF-8',
          },
          Html: {
            Data: formatIntakeEmailHtml(intake),
            Charset: 'UTF-8',
          },
        },
      },
    });

    await sesClient.send(command);
    console.log(`[SES] Notification sent for ${intake.source} - ${intake.email}`);
  } catch (error) {
    console.error('[SES] Failed to send notification:', error);
    throw error;
  }
}

function formatIntakeEmail(intake: IntakeNotification): string {
  let body = `New lead intake received via ${intake.source}\n\n`;
  body += `Name: ${intake.name}\n`;
  body += `Email: ${intake.email}\n`;
  body += `Business: ${intake.businessName}\n`;
  body += `\n`;

  if (intake.payload) {
    body += `Additional Details:\n`;
    body += `${JSON.stringify(intake.payload, null, 2)}\n`;
  }

  body += `\n---\n`;
  body += `Received at: ${new Date().toISOString()}\n`;

  return body;
}

function formatIntakeEmailHtml(intake: IntakeNotification): string {
  let html = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a56db;">New Lead Intake: ${intake.source}</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${intake.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${intake.email}">${intake.email}</a></p>
          <p><strong>Business:</strong> ${intake.businessName}</p>
        </div>
  `;

  if (intake.payload) {
    html += `
      <h3>Additional Details</h3>
      <div style="background: #f9fafb; padding: 15px; border-radius: 6px; font-size: 14px;">
        <pre style="white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(intake.payload, null, 2)}</pre>
      </div>
    `;
  }

  html += `
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Received at: ${new Date().toISOString()}
        </p>
      </body>
    </html>
  `;

  return html;
}
