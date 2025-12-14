import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Temporary no-op middleware for local development to unblock auth page
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
