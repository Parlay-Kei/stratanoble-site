'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initializeAnalytics, trackPageView } from '@/lib/analytics';

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize analytics on component mount
  useEffect(() => {
    initializeAnalytics();
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (pathname) {
      const fullPath = searchParams.toString() 
        ? `${pathname}?${searchParams.toString()}` 
        : pathname;
      
      trackPageView(fullPath, {
        referrer: document.referrer,
        user_agent: navigator.userAgent,
      });
    }
  }, [pathname, searchParams]);

  return null;
}