'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const ToastProviderInner = dynamic(
  () => import('./toast').then((mod) => ({ default: mod.ToastProvider })),
  {
    ssr: false,
    loading: () => null,
  }
);

export function ClientToastProvider({ children }: { children: React.ReactNode }) {
  return <ToastProviderInner>{children}</ToastProviderInner>;
}
