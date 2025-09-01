import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SES_SECRET = process.env.AWS_SES_SECRET;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL;
import { logger } from './logger';

let sesClient: SESv2Client | null = null;

function getSESClient(): SESv2Client {
  if (!sesClient) {
    if (!AWS_ACCESS_KEY_ID || !AWS_SES_SECRET) {
      throw new Error('AWS credentials not configured. Email functionality is disabled.');
    }
    
    sesClient = new SESv2Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SES_SECRET,
      },
    });
  }
  
  return sesClient;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    const ses = getSESClient();
    
    if (!SES_FROM_EMAIL) {
      throw new Error('SES_FROM_EMAIL not configured');
    }
    
    const cmd = new SendEmailCommand({
      Destination: { ToAddresses: [to] },
      FromEmailAddress: SES_FROM_EMAIL,
      Content: {
        Simple: {
          Subject: { Data: subject },
          Body: { Html: { Data: html } },
        },
      },
    });
    
    await ses.send(cmd);
    logger.info(`Email sent successfully to ${to}`);
  } catch (error) {
    logger.error('Failed to send email', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}
