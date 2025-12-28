'use client';

/**
 * ACHIEVERY Image Preloader Component
 * Optimizes loading performance for critical images on preview page
 */

import { useEffect } from 'react';

interface ImagePreloaderProps {
  images: string[];
  priority?: boolean;
}

export const ImagePreloader: React.FC<ImagePreloaderProps> = ({ images, priority = false }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Preload critical images
    images.forEach((src) => {
      const link = document.createElement('link');
      link.rel = priority ? 'preload' : 'prefetch';
      link.as = 'image';
      link.href = src;

      // Add to document head
      document.head.appendChild(link);
    });

    // Cleanup function
    return () => {
      images.forEach((src) => {
        const existingLink = document.querySelector(`link[href="${src}"]`);
        if (existingLink) {
          document.head.removeChild(existingLink);
        }
      });
    };
  }, [images, priority]);

  return null; // This component doesn't render anything
};

// Critical images for ACHIEVERY preview page
export const ACHIEVERY_CRITICAL_IMAGES = [
  '/images/achievery/dashboard-growth-tier.webp',
  '/images/achievery/signin-interface.webp',
  '/images/achievery/mobile-responsive-demo.webp'
];

// Secondary images for lazy loading
export const ACHIEVERY_SECONDARY_IMAGES = [
  '/images/achievery/dashboard-free-tier.webp',
  '/images/achievery/dashboard-partner-tier.webp',
  '/images/achievery/tier-comparison-grid.webp'
];