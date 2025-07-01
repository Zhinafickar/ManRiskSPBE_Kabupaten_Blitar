'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userProfile) {
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
  }, [userProfile, loading, router]);

  return (
    <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    </div>
  )
}
