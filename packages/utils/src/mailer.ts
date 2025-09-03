import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { config } from './config';

const ses = new SESv2Client({
  region: config.AWS_REGION,
  credentials: config.AWS_ACCESS_KEY_ID && config.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

export async function sendEmail(to: string, subject: string, html: string) {
  const cmd = new SendEmailCommand({
    Destination: { ToAddresses: [to] },
    FromEmailAddress: config.SES_FROM_EMAIL,
    Content: {
      Simple: {
        Subject: { Data: subject },
        Body: { Html: { Data: html } },
      },
    },
  });
  await ses.send(cmd);
}