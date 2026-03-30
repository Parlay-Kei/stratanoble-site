'use client';

import dynamic from 'next/dynamic';

// Lazy-load client components below the fold for better performance
// Using ssr: false to prevent hydration mismatches with useState and framer-motion
const SmartConsultingBar = dynamic(() => import('@/components/SmartConsultingBar').then(mod => ({ default: mod.SmartConsultingBar })), {
  ssr: false,
});

export { SmartConsultingBar };
