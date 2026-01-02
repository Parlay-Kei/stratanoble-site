'use client';

import dynamic from 'next/dynamic';

// Lazy-load client components below the fold for better performance
// Using ssr: false to prevent hydration mismatches with useState and framer-motion
const SmartConsultingBar = dynamic(() => import('@/components/SmartConsultingBar').then(mod => ({ default: mod.SmartConsultingBar })), {
  ssr: false,
});

const WhatWeInstallSection = dynamic(() => import('@/components/revamp/WhatWeInstallSection').then(mod => ({ default: mod.WhatWeInstallSection })), {
  ssr: false,
});

const PrinciplesSection = dynamic(() => import('@/components/revamp/PrinciplesSection').then(mod => ({ default: mod.PrinciplesSection })), {
  ssr: false,
});

export { SmartConsultingBar, WhatWeInstallSection, PrinciplesSection };
