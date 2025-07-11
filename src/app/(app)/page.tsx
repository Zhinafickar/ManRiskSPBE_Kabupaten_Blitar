'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

// This is a client-side component that handles redirection based on user role.
// It's placed inside the (app) group to ensure it's part of the authenticated layout.
export default function AppRootPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (userProfile) {
      switch (userProfile.role) {
        case 'superadmin':
          router.replace('/superadmin/dashboard');
          break;
        case 'admin':
          router.replace('/admuinma/dashboard');
          break;
        default:
          router.replace('/user/dashboard');
          break;
      }
    } else {
        // If profile is somehow not available (e.g., during logout transition),
        // redirect to login.
        router.replace('/login');
    }
  }, [userProfile, loading, router]);

  // Render a loading skeleton while redirecting
  return (
    <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
    </div>
  );
}
