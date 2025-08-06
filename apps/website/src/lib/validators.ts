import { z } from 'zod';

// Common validation patterns
const emailSchema = z.string().email('Please enter a valid email address');
const phoneSchema = z.string().regex(/^\+?[\d\s\-().]{7,20}$/, 'Please enter a valid phone number').optional();
const nameSchema = z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters');
const urlSchema = z.string().url('Please enter a valid URL').optional();

// Contact form validation
export const ContactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  topic: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be less than 1000 characters'),
  source: z.string().default('website'),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

// Lead creation schema
export const CreateLeadSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  businessStage: z.enum(['idea', 'startup', 'growth', 'scale'], {
    errorMap: () => ({ message: 'Please select a valid business stage' }),
  }),
  mainChallenge: z.string().min(10, 'Please describe your main challenge').max(500, 'Challenge description must be less than 500 characters'),
  interestedTier: z.enum(['none', 'lite', 'growth', 'partner'], {
    errorMap: () => ({ message: 'Please select a valid tier' }),
  }),
  referralSource: z.string().optional(),
  timeline: z.enum(['immediate', '1-3months', '3-6months', '6+months']).optional(),
});

export type CreateLeadData = z.infer<typeof CreateLeadSchema>;

// Stripe checkout validation
export const CheckoutSessionSchema = z.object({
  offeringId: z.enum(['lite', 'growth', 'partner'], {
    errorMap: () => ({ message: 'Please select a valid offering' }),
  }),
  customerEmail: emailSchema,
  customerName: nameSchema,
  promoCode: z.string().max(50, 'Promo code must be less than 50 characters').optional(),
  test: z.boolean().default(false),
});

export type CheckoutSessionData = z.infer<typeof CheckoutSessionSchema>;

// Customer portal validation
export const CustomerPortalSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  returnUrl: urlSchema,
});

export type CustomerPortalData = z.infer<typeof CustomerPortalSchema>;

// Waitlist validation
export const WaitlistSchema = z.object({
  email: emailSchema,
  name: nameSchema.optional(),
  interestedFeatures: z.array(z.string()).default([]),
  source: z.string().default('website'),
});

export type WaitlistData = z.infer<typeof WaitlistSchema>;

// Email sending validation
export const SendEmailSchema = z.object({
  formType: z.enum(['contact', 'discovery', 'waitlist', 'support']),
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  message: z.string().min(1, 'Message is required').max(2000, 'Message must be less than 2000 characters').optional(),
  // Additional fields based on form type
  businessStage: z.string().optional(),
  mainChallenge: z.string().optional(),
  interestedTier: z.string().optional(),
  topic: z.string().optional(),
});

export type SendEmailData = z.infer<typeof SendEmailSchema>;

// Webhook validation for Stripe
export const StripeWebhookSchema = z.object({
  id: z.string(),
  object: z.literal('event'),
  type: z.string(),
  data: z.object({
    object: z.record(z.any()),
  }),
  created: z.number(),
  livemode: z.boolean(),
});

export type StripeWebhookData = z.infer<typeof StripeWebhookSchema>;

// Generic API response schemas
export const ApiErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  code: z.string().optional(),
  details: z.record(z.any()).optional(),
});

export const ApiSuccessSchema = z.object({
  success: z.boolean().default(true),
  message: z.string().optional(),
  data: z.any().optional(),
});

// Validation utility functions
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true;
  data: T;
} | {
  success: false;
  errors: z.ZodError<T>;
  errorMap: Record<string, string>;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Create a flattened error map for easier handling
  const errorMap: Record<string, string> = {};
  result.error.errors.forEach((error) => {
    const path = error.path.join('.');
    errorMap[path] = error.message;
  });
  
  return {
    success: false,
    errors: result.error,
    errorMap,
  };
}

// API response helpers
export function createValidationErrorResponse(errors: Record<string, string>) {
  return {
    error: 'Validation failed',
    message: 'Please check your input and try again',
    details: errors,
  };
}

export function createSuccessResponse(data?: any, message?: string) {
  return {
    success: true,
    ...(message && { message }),
    ...(data && { data }),
  };
}

// Rate limiting validation
export const RateLimitConfigSchema = z.object({
  requests: z.number().min(1).max(10000),
  window: z.number().min(1).max(3600), // Max 1 hour window
  identifier: z.string().min(1),
});

export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;

// Environment validation schema
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SENDGRID_API_KEY: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

export type EnvConfig = z.infer<typeof EnvSchema>;