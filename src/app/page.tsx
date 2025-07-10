'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait until auth state is resolved

    if (!user) {
      // Not logged in, go to login page
      router.replace('/login');
    } else if (userProfile) {
      // Logged in and profile exists, redirect based on role
      switch (userProfile.role) {
        case 'superadmin':
          router.replace('/superadmin/dashboard');
          break;
        case 'admin':
          router.replace('/admuinma/dashboard');
          break;
        default:
          // Assumes 'user' or any other role
          router.replace('/user/dashboard');
          break;
      }
    }
    // If user exists but userProfile is null, the AuthProvider handles the loading screen,
    // so we just wait for the profile to load.
  }, [user, userProfile, loading, router]);

  // Show a loading skeleton while the redirect is happening
  // This prevents a flash of unstyled content or a blank page.
  return (
      <div className="flex h-screen w-full items-center justify-center">
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
