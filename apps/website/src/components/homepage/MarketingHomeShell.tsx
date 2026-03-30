'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

const SmartConsultingBar = dynamic(
  () => import('@/components/SmartConsultingBar').then((mod) => ({ default: mod.SmartConsultingBar })),
  { ssr: false },
);

export function MarketingHomeShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SmartConsultingBar />
      {children}
    </>
  );
}
