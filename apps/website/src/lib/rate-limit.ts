import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = Redis.fromEnv();

// IP-based rate limiting: 5 requests per 10 minutes per IP
export const ipRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  prefix: 'intake:ip:',
  analytics: true,
});

// Email-based rate limiting: 3 requests per 10 minutes per email
export const emailRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'),
  prefix: 'intake:email:',
  analytics: true,
});
