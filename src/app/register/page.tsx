import { getAssignedRoles } from '@/services/user-service';
import { ROLES } from '@/constants/data';
import RegisterForm from './_components/register-form';
import Link from 'next/link';
import { Icons } from '@/components/icons';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  const assignedRoles = await getAssignedRoles();
  const availableRoles = ROLES.filter((role) => !assignedRoles.includes(role));

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
        <RegisterForm availableRoles={availableRoles} />
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
