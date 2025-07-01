import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getAllUsers } from "@/services/user-service";
import { ROLES } from "@/constants/data";
import { UserTable } from "./_components/user-table";

export const dynamic = 'force-dynamic';

export default async function UserManagementPage() {
  const users = await getAllUsers();
  const allRoles = [...ROLES, 'admin', 'superadmin']; // All possible roles

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          View, add, edit, and delete user accounts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserTable users={users as any} allRoles={allRoles} />
      </CardContent>
    </Card>
  );
}
