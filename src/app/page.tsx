'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

function RootPageSkeleton() {
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


export default function Home() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until the authentication status is fully resolved
    if (loading) {
      return; // Do nothing while loading
    }

    if (!user) {
      // If not logged in, redirect to login page
      router.replace('/login');
    } else if (userProfile) {
      // If logged in and profile exists, redirect based on role
      switch (userProfile.role) {
        case 'admin':
          router.replace('/admin/dashboard');
          break;
        case 'superadmin':
          router.replace('/superadmin/dashboard');
          break;
        default:
          router.replace('/user/dashboard');
          break;
      }
    }
    // If user exists but userProfile is somehow null after loading,
    // the AuthProvider should handle logging them out.
    // We just show the skeleton in that edge case while the redirect happens.
  }, [user, userProfile, loading, router]);

  // Show a skeleton while the redirection logic is running
  return <RootPageSkeleton />;
}
