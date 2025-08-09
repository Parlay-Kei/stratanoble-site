import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { env } from './env';
import logger from './logger';

let sesClient: SESv2Client | null = null;

function getSESClient(): SESv2Client {
  if (!sesClient) {
    if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured. Email functionality is disabled.');
    }
    
    sesClient = new SESv2Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  
  return sesClient;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    const ses = getSESClient();
    
    if (!env.SES_FROM_EMAIL) {
      throw new Error('SES_FROM_EMAIL not configured');
    }
    
    const cmd = new SendEmailCommand({
      Destination: { ToAddresses: [to] },
      FromEmailAddress: env.SES_FROM_EMAIL,
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
    logger.error('Failed to send email:', error);
    throw error;
  }
}
