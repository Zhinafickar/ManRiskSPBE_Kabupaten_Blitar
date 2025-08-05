'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getAllUsers } from "@/services/user-service";
import { ROLES } from "@/constants/roles";
import { RoleList } from "./_components/role-list";
import type { UserProfile } from '@/types/user';
import { Skeleton } from '@/components/ui/skeleton';
import { ADMIN_ROLES } from '@/constants/admin-data';

export type GroupedUsers = Record<string, UserProfile[]>;

function RolePageSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    )
}

export default function RoleManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const allRoles = [...ROLES, ...ADMIN_ROLES];

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const groupedUsers = useMemo(() => {
    const groups: GroupedUsers = {};
    
    // Initialize all possible roles to ensure they appear in the accordion
    allRoles.forEach(role => {
        groups[role] = [];
    });
    
    // Group users by role
    users.forEach(user => {
      if (user.role in groups) {
        groups[user.role].push(user);
      } else {
        // Fallback for roles not in the constant files
        groups[user.role] = [user];
      }
    });

    return groups;
  }, [users, allRoles]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Management</CardTitle>
        <CardDescription>
          View all roles and the users assigned to them. You can edit or delete users from here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <RolePageSkeleton />
        ) : (
          <RoleList groupedUsers={groupedUsers} allRoles={allRoles} />
        )}
      </CardContent>
    </Card>
  );
}
