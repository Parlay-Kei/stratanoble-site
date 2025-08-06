import { NextRequest } from 'next/server';
import { POST } from '@/app/api/email/send/route';
import { sendEmail } from '@/lib/mailer';
import sgMail from '@sendgrid/mail';

// Mock the email services
jest.mock('@/lib/mailer');
jest.mock('@sendgrid/mail');

const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;
const mockSgMail = sgMail as jest.Mocked<typeof sgMail>;

describe('/api/email/send', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up common environment variables
    process.env.ADMIN_EMAIL = 'admin@test.com';
    process.env.SES_FROM_EMAIL = 'noreply@test.com';
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.EMAIL_DRIVER;
    delete process.env.SENDGRID_API_KEY;
    delete process.env.AWS_SES_REGION;
    delete process.env.AWS_SES_ACCESS_KEY;
    delete process.env.AWS_SES_SECRET;
    delete process.env.SES_FROM_EMAIL;
    delete process.env.ADMIN_EMAIL;
    
    jest.resetModules();
  });

  describe('with AWS SES driver', () => {
    beforeEach(() => {
      process.env.EMAIL_DRIVER = 'ses';
      process.env.AWS_SES_REGION = 'us-east-1';
      process.env.AWS_SES_ACCESS_KEY = 'test-key';
      process.env.AWS_SES_SECRET = 'test-secret';
      process.env.SES_FROM_EMAIL = 'noreply@test.com';
      
      mockSendEmail.mockResolvedValue(undefined);
    });

    it('should send contact form emails via SES', async () => {
      const requestBody = {
        formType: 'contact',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        topic: 'General Inquiry',
        message: 'This is a test message.'
      };

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Contact form submitted successfully');
      
      // Should call SES twice (admin + customer emails)
      expect(mockSendEmail).toHaveBeenCalledTimes(2);
      
      // Check admin email
      expect(mockSendEmail).toHaveBeenCalledWith(
        'admin@test.com',
        'New Contact Form Submission: General Inquiry',
        expect.stringContaining('John Doe'),
        expect.stringContaining('john@example.com')
      );
      
      // Check customer email  
      expect(mockSendEmail).toHaveBeenCalledWith(
        'john@example.com',
        'Thank you for contacting Strata Noble',
        expect.stringContaining('Hi John Doe'),
        expect.stringContaining('Thank you for reaching out!')
      );
    });

    it('should return error if SES not configured', async () => {
      delete process.env.AWS_SES_REGION;
      
      // Need to re-import the route to get updated env vars
      jest.resetModules();
      const { POST: PostUpdated } = require('@/app/api/email/send/route');

      const requestBody = {
        formType: 'contact',
        name: 'John Doe',
        email: 'john@example.com',
        topic: 'Test',
        message: 'Test message'
      };

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await PostUpdated(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toBe('AWS SES email service not configured');
    });
  });

  describe('with SendGrid driver (default)', () => {
    beforeEach(() => {
      process.env.EMAIL_DRIVER = 'sendgrid';
      process.env.SENDGRID_API_KEY = 'test-sendgrid-key';
      
      mockSgMail.send.mockResolvedValue([{} as any, {}]);
      mockSgMail.setApiKey.mockImplementation(() => {});
    });

    it('should send contact form emails via SendGrid', async () => {
      const requestBody = {
        formType: 'contact',
        name: 'Jane Doe',
        email: 'jane@example.com',
        topic: 'Support Request',
        message: 'Need help with something.'
      };

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      
      // Should call SendGrid twice (admin + customer emails)
      expect(mockSgMail.send).toHaveBeenCalledTimes(2);
      
      // Check that emails were sent to correct recipients
      const calls = mockSgMail.send.mock.calls;
      const adminCall = calls.find(call => call[0].to === 'admin@test.com');
      const customerCall = calls.find(call => call[0].to === 'jane@example.com');
      
      expect(adminCall).toBeDefined();
      expect(customerCall).toBeDefined();
      expect(adminCall![0].subject).toBe('New Contact Form Submission: Support Request');
      expect(customerCall![0].subject).toBe('Thank you for contacting Strata Noble');
    });

    it('should return error if SendGrid not configured', async () => {
      delete process.env.SENDGRID_API_KEY;
      
      // Need to re-import the route to get updated env vars
      jest.resetModules();
      const { POST: PostUpdated } = require('@/app/api/email/send/route');

      const requestBody = {
        formType: 'contact',
        name: 'John Doe',
        email: 'john@example.com',
        topic: 'Test',
        message: 'Test message'
      };

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await PostUpdated(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toBe('SendGrid email service not configured');
    });
  });

  describe('form validation', () => {
    beforeEach(() => {
      process.env.EMAIL_DRIVER = 'ses';
      process.env.AWS_SES_REGION = 'us-east-1';
      process.env.AWS_SES_ACCESS_KEY = 'test-key';
      process.env.AWS_SES_SECRET = 'test-secret';
      process.env.SES_FROM_EMAIL = 'noreply@test.com';
      
      mockSendEmail.mockResolvedValue(undefined);
    });

    it('should validate required fields for contact form', async () => {
      const requestBody = {
        formType: 'contact',
        name: '',
        email: 'invalid-email',
        topic: '',
        message: ''
      };

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid form data');
      expect(result.details).toBeDefined();
      expect(result.details.length).toBeGreaterThan(0);
    });

    it('should handle invalid form type', async () => {
      const requestBody = {
        formType: 'invalid-form-type',
        name: 'John Doe',
        email: 'john@example.com'
      };

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid form type');
    });
  });

  describe('discovery form', () => {
    beforeEach(() => {
      process.env.EMAIL_DRIVER = 'ses';
      process.env.AWS_SES_REGION = 'us-east-1';
      process.env.AWS_SES_ACCESS_KEY = 'test-key';
      process.env.AWS_SES_SECRET = 'test-secret';
      process.env.SES_FROM_EMAIL = 'noreply@test.com';
      
      mockSendEmail.mockResolvedValue(undefined);
    });

    it('should send discovery call emails', async () => {
      const requestBody = {
        formType: 'discovery',
        name: 'Alice Smith',
        email: 'alice@example.com',
        businessStage: 'early-stage',
        mainChallenge: 'Need better systems',
        interestedTier: 'growth'
      };

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Discovery call request submitted successfully');
      expect(mockSendEmail).toHaveBeenCalledTimes(2);
    });
  });

  describe('analysis form', () => {
    beforeEach(() => {
      process.env.EMAIL_DRIVER = 'ses';
      process.env.AWS_SES_REGION = 'us-east-1';
      process.env.AWS_SES_ACCESS_KEY = 'test-key';
      process.env.AWS_SES_SECRET = 'test-secret';
      process.env.SES_FROM_EMAIL = 'noreply@test.com';
      
      mockSendEmail.mockResolvedValue(undefined);
    });

    it('should send analysis request emails', async () => {
      const requestBody = {
        formType: 'analysis',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        companySize: '50-100',
        dataPainPoint: 'Poor reporting',
        message: 'We need better analytics'
      };

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Analysis request submitted successfully');
      expect(mockSendEmail).toHaveBeenCalledTimes(2);
    });
  });
});