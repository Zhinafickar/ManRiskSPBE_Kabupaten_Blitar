'use client';

import { getAssignedRoles } from '@/services/user-service';
import { ROLES } from '@/constants/data';
import RegisterForm from './_components/register-form';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function RegisterPage() {
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const assignedRoles = await getAssignedRoles();
        const roles = ROLES.filter((role) => !assignedRoles.includes(role));
        setAvailableRoles(roles);
      } catch (error) {
        console.error("Failed to fetch roles, falling back to all roles:", error);
        // Fallback to all roles if Firestore is not available, so registration is still possible.
        setAvailableRoles(ROLES);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <Icons.Logo className="h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold mt-4">Create an Account</h1>
          <p className="text-muted-foreground">
            Fill in the details below to join Risk Navigator.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
             <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <RegisterForm availableRoles={availableRoles} />
        )}
        
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
