'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AdminGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function AdminGuard({ children, redirectTo = '/auth/signin' }: AdminGuardProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        router.push(redirectTo);
        return;
      }

      const userEmail = session.user.email?.toLowerCase() || '';
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() || '';

      // Check if user is admin: either matches ADMIN_EMAIL or has @stratanoble.com domain
      const isAdmin = (adminEmail && userEmail === adminEmail) || /@stratanoble\.com$/i.test(userEmail);

      if (!isAdmin) {
        // User is authenticated but not admin - show 403
        router.push('/403');
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push(redirectTo);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
