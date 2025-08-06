import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

const ses = new SESv2Client({
  region: process.env.AWS_SES_REGION,
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SES_SECRET!,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  const cmd = new SendEmailCommand({
    Destination: { ToAddresses: [to] },
    FromEmailAddress: process.env.SES_FROM_EMAIL,
    Content: {
      Simple: {
        Subject: { Data: subject },
        Body: { Html: { Data: html } },
      },
    },
  });
  await ses.send(cmd);
}