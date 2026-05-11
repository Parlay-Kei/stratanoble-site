'use client';

import dynamic from 'next/dynamic';

const SmartConsultingBar = dynamic(
  () => import('@/components/SmartConsultingBar').then((mod) => ({ default: mod.SmartConsultingBar })),
  { ssr: false },
);

export function SmartConsultingBarClient() {
  return <SmartConsultingBar />;
}
