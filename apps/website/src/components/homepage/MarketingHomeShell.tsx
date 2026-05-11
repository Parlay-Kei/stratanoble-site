import type { ReactNode } from 'react';

import { SmartConsultingBarClient } from '@/components/SmartConsultingBarClient';

export function MarketingHomeShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SmartConsultingBarClient />
      {children}
    </>
  );
}
