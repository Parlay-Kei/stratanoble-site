import {
  ContactFormSchema,
  CheckoutSessionSchema,
  CreateLeadSchema,
  validateRequest,
  createValidationErrorResponse,
  createSuccessResponse,
} from '../validators';

describe('Input Validation Schemas', () => {
  describe('ContactFormSchema', () => {
    it('should validate correct contact form data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        topic: 'general',
        message: 'This is a test message with sufficient length.',
        source: 'website',
      };

      const result = validateRequest(ContactFormSchema, validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
        expect(result.data.email).toBe('john@example.com');
      }
    });

    it('should reject invalid email addresses', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'This is a test message.',
      };

      const result = validateRequest(ContactFormSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMap.email).toContain('valid email');
      }
    });

    it('should reject short messages', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Short',
      };

      const result = validateRequest(ContactFormSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMap.message).toContain('at least 10 characters');
      }
    });

    it('should reject very long messages', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'x'.repeat(1001),
      };

      const result = validateRequest(ContactFormSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMap.message).toContain('less than 1000 characters');
      }
    });

    it('should handle missing required fields', () => {
      const invalidData = {
        email: 'john@example.com',
        // missing name and message
      };

      const result = validateRequest(ContactFormSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMap.name).toBeDefined();
        expect(result.errorMap.message).toBeDefined();
      }
    });
  });

  describe('CheckoutSessionSchema', () => {
    it('should validate correct checkout data', () => {
      const validData = {
        offeringId: 'lite',
        customerEmail: 'customer@example.com',
        customerName: 'Jane Customer',
        promoCode: 'DISCOUNT10',
        test: false,
      };

      const result = validateRequest(CheckoutSessionSchema, validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.offeringId).toBe('lite');
        expect(result.data.test).toBe(false);
      }
    });

    it('should reject invalid offering IDs', () => {
      const invalidData = {
        offeringId: 'invalid',
        customerEmail: 'customer@example.com',
        customerName: 'Jane Customer',
      };

      const result = validateRequest(CheckoutSessionSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMap.offeringId).toContain('valid offering');
      }
    });

    it('should default test to false', () => {
      const validData = {
        offeringId: 'growth',
        customerEmail: 'customer@example.com',
        customerName: 'Jane Customer',
      };

      const result = validateRequest(CheckoutSessionSchema, validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.test).toBe(false);
      }
    });
  });

  describe('CreateLeadSchema', () => {
    it('should validate correct lead data', () => {
      const validData = {
        name: 'Lead Name',
        email: 'lead@example.com',
        phone: '+1234567890',
        businessStage: 'startup',
        mainChallenge: 'We need help scaling our marketing efforts effectively.',
        interestedTier: 'growth',
        timeline: '1-3months',
      };

      const result = validateRequest(CreateLeadSchema, validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.businessStage).toBe('startup');
        expect(result.data.interestedTier).toBe('growth');
      }
    });

    it('should reject invalid business stages', () => {
      const invalidData = {
        name: 'Lead Name',
        email: 'lead@example.com',
        businessStage: 'invalid-stage',
        mainChallenge: 'This is our challenge.',
        interestedTier: 'lite',
      };

      const result = validateRequest(CreateLeadSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMap.businessStage).toContain('valid business stage');
      }
    });

    it('should reject short challenge descriptions', () => {
      const invalidData = {
        name: 'Lead Name',
        email: 'lead@example.com',
        businessStage: 'growth',
        mainChallenge: 'Short',
        interestedTier: 'partner',
      };

      const result = validateRequest(CreateLeadSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMap.mainChallenge).toContain('describe your main challenge');
      }
    });
  });

  describe('Validation Utilities', () => {
    it('should create proper validation error responses', () => {
      const errors = {
        email: 'Invalid email format',
        name: 'Name is required',
      };

      const response = createValidationErrorResponse(errors);
      expect(response.error).toBe('Validation failed');
      expect(response.message).toBe('Please check your input and try again');
      expect(response.details).toEqual(errors);
    });

    it('should create proper success responses', () => {
      const data = { id: '123', status: 'created' };
      const message = 'Resource created successfully';

      const response = createSuccessResponse(data, message);
      expect(response.success).toBe(true);
      expect(response.message).toBe(message);
      expect(response.data).toEqual(data);
    });

    it('should create success responses without data or message', () => {
      const response = createSuccessResponse();
      expect(response.success).toBe(true);
      expect(response.data).toBeUndefined();
      expect(response.message).toBeUndefined();
    });
  });

  describe('Phone Number Validation', () => {
    it('should accept various valid phone number formats', () => {
      const validPhones = [
        '+1234567890',
        '+1 (234) 567-8900',
        '234-567-8900',
        '234.567.8900',
        '(234) 567-8900',
        '+44 20 7946 0958',
      ];

      validPhones.forEach((phone) => {
        const data = {
          name: 'Test User',
          email: 'test@example.com',
          phone,
          message: 'This is a test message with sufficient length.',
        };

        const result = validateRequest(ContactFormSchema, data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = ['123', 'abc', '123-abc-def'];

      invalidPhones.forEach((phone) => {
        const data = {
          name: 'Test User',
          email: 'test@example.com',
          phone,
          message: 'This is a test message with sufficient length.',
        };

        const result = validateRequest(ContactFormSchema, data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errorMap.phone).toContain('valid phone number');
        }
      });
    });
  });

  describe('Security Tests', () => {
    it('should sanitize and validate potentially malicious input', () => {
      const maliciousData = {
        name: '<script>alert("XSS")</script>',
        email: 'test@example.com',
        message: 'Normal message content here.',
      };

      const result = validateRequest(ContactFormSchema, maliciousData);
      expect(result.success).toBe(true);
      if (result.success) {
        // Schema validation should pass, but the actual content contains script tags
        // This would be handled by XSS protection in SafeHTML component
        expect(result.data.name).toContain('<script>');
      }
    });

    it('should enforce maximum lengths to prevent DoS', () => {
      const longData = {
        name: 'x'.repeat(101), // Over 100 character limit
        email: 'test@example.com',
        message: 'x'.repeat(1001), // Over 1000 character limit
      };

      const result = validateRequest(ContactFormSchema, longData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorMap.name).toContain('less than 100 characters');
        expect(result.errorMap.message).toContain('less than 1000 characters');
      }
    });
  });
});