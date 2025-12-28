'use client';

import React from 'react'
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initializeAnalytics, trackPageView } from '@/lib/analytics';

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);

  // Ensure we're only running client-side code after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize analytics on component mount (client-side only)
  useEffect(() => {
    if (!isClient) return;

    try {
      initializeAnalytics();
    } catch (error) {
      console.warn('Analytics initialization failed:', error);
    }
  }, [isClient]);

  // Track page views on route changes (client-side only)
  useEffect(() => {
    if (!isClient || !pathname) return;

    try {
      const fullPath = searchParams?.toString()
        ? `${pathname}?${searchParams?.toString()}`
        : pathname;

      trackPageView(fullPath, {
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      });
    } catch (error) {
      console.warn('Page view tracking failed:', error);
    }
  }, [isClient, pathname, searchParams]);

  return null;
}