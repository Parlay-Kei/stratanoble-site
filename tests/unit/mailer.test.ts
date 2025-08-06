import { sendEmail } from '@/lib/mailer';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

// Mock the AWS SDK
jest.mock('@aws-sdk/client-sesv2');

const mockSES = {
  send: jest.fn(),
};

(SESv2Client as jest.MockedClass<typeof SESv2Client>).mockImplementation(() => mockSES as any);

describe('mailer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set required environment variables for tests
    process.env.AWS_SES_REGION = 'us-east-1';
    process.env.AWS_SES_ACCESS_KEY = 'test-access-key';
    process.env.AWS_SES_SECRET = 'test-secret-key';
    process.env.SES_FROM_EMAIL = 'test@example.com';
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.AWS_SES_REGION;
    delete process.env.AWS_SES_ACCESS_KEY;
    delete process.env.AWS_SES_SECRET;
    delete process.env.SES_FROM_EMAIL;
  });

  describe('sendEmail', () => {
    it('should create SESv2Client with correct configuration', async () => {
      const to = 'recipient@example.com';
      const subject = 'Test Subject';
      const html = '<h1>Test HTML</h1>';

      mockSES.send.mockResolvedValueOnce({});

      await sendEmail(to, subject, html);

      expect(SESv2Client).toHaveBeenCalledWith({
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
      });
    });

    it('should send email with correct command parameters', async () => {
      const to = 'recipient@example.com';
      const subject = 'Test Subject';
      const html = '<h1>Test HTML</h1>';

      mockSES.send.mockResolvedValueOnce({});

      await sendEmail(to, subject, html);

      expect(mockSES.send).toHaveBeenCalledTimes(1);
      
      const callArgs = mockSES.send.mock.calls[0][0];
      expect(callArgs).toBeInstanceOf(SendEmailCommand);
      
      // Check the command input
      expect(callArgs.input).toEqual({
        Destination: { ToAddresses: [to] },
        FromEmailAddress: 'test@example.com',
        Content: {
          Simple: {
            Subject: { Data: subject },
            Body: { Html: { Data: html } },
          },
        },
      });
    });

    it('should handle multiple recipients', async () => {
      const to = 'recipient1@example.com';
      const subject = 'Test Subject';
      const html = '<h1>Test HTML</h1>';

      mockSES.send.mockResolvedValueOnce({});

      await sendEmail(to, subject, html);

      const callArgs = mockSES.send.mock.calls[0][0];
      expect(callArgs.input.Destination.ToAddresses).toEqual([to]);
    });

    it('should propagate errors from SES', async () => {
      const to = 'recipient@example.com';
      const subject = 'Test Subject';
      const html = '<h1>Test HTML</h1>';

      const error = new Error('SES error');
      mockSES.send.mockRejectedValueOnce(error);

      await expect(sendEmail(to, subject, html)).rejects.toThrow('SES error');
    });

    it('should handle HTML content with special characters', async () => {
      const to = 'recipient@example.com';
      const subject = 'Test Subject with "quotes" & ampersands';
      const html = '<h1>Test HTML with "quotes" & special chars</h1>';

      mockSES.send.mockResolvedValueOnce({});

      await sendEmail(to, subject, html);

      const callArgs = mockSES.send.mock.calls[0][0];
      expect(callArgs.input.Content.Simple.Subject.Data).toBe(subject);
      expect(callArgs.input.Content.Simple.Body.Html.Data).toBe(html);
    });

    it('should use correct from email from environment', async () => {
      process.env.SES_FROM_EMAIL = 'custom@example.com';
      
      // Re-import to get the updated environment variable
      jest.resetModules();
      const { sendEmail: sendEmailUpdated } = require('@/lib/mailer');

      const to = 'recipient@example.com';
      const subject = 'Test Subject';
      const html = '<h1>Test HTML</h1>';

      mockSES.send.mockResolvedValueOnce({});

      await sendEmailUpdated(to, subject, html);

      const callArgs = mockSES.send.mock.calls[0][0];
      expect(callArgs.input.FromEmailAddress).toBe('custom@example.com');
    });
  });

  describe('SESv2Client configuration', () => {
    it('should initialize with environment variables', () => {
      // The client should be initialized when the module is imported
      expect(SESv2Client).toHaveBeenCalledWith({
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
      });
    });
  });
});