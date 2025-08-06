import { getCSRFTokenEndpoint } from '@/lib/csrf';

export async function GET() {
  return getCSRFTokenEndpoint();
}