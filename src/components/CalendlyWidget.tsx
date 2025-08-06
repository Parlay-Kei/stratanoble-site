'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface CalendlyWidgetProps {
  url: string;
}

export default function CalendlyWidget({ url }: CalendlyWidgetProps) {
  const calendlyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Calendly widget when component mounts
    if (window.Calendly && calendlyRef.current) {
      window.Calendly.initInlineWidget({
        url: url,
        parentElement: calendlyRef.current,
        minWidth: 320,
        hideGdprBanner: true,
      });
    }
  }, [url]);

  return (
    <>
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
        onLoad={() => {
          // Widget will be initialized in useEffect
        }}
      />
      <div 
        ref={calendlyRef}
        className="min-h-[700px] w-full"
        data-url={url}
      />
    </>
  );
}

// Extend Window interface for Calendly
declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        minWidth?: number;
        hideGdprBanner?: boolean;
      }) => void;
    };
  }
} 