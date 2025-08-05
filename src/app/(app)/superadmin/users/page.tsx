'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getAllUsers } from "@/services/user-service";
import { ROLES } from "@/constants/roles";
import { UserTable } from "./_components/user-table";
import type { UserProfile } from '@/types/user';
import { Skeleton } from '@/components/ui/skeleton';
import { ADMIN_ROLES } from '@/constants/admin-data';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const allRoles = [...ROLES, ...ADMIN_ROLES]; // All possible roles

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          View, add, edit, and delete user accounts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <Skeleton className="h-10 w-28" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        ) : (
          <UserTable users={users} allRoles={allRoles} />
        )}
      </CardContent>
    </Card>
  );
}
