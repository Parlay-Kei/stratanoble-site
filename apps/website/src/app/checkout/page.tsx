'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';

/**
 * Legacy checkout selected SaaS tiers with Stripe price IDs (pre–offer architecture v2.1).
 * Catalog sales are coordinated via /services and /contact; send visitors there.
 */
function CheckoutRedirectContent() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/services');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <p className="text-navy-700 text-center">Redirecting to services…</p>
    </div>
  );
}

function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <p className="text-navy-700">Loading…</p>
        </div>
      }
    >
      <CheckoutRedirectContent />
    </Suspense>
  );
}

export default CheckoutPage;
