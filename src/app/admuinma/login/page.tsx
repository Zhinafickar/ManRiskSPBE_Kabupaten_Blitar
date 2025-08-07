
'use client';

import { LoginPageClient } from "@/app/_components/login-page-client";
import { TokenVerification } from "@/app/admuinma/_components/token-verification";
import { useAdminVerification } from '../_components/admin-verification-context';
import { useEffect, useState } from "react";
import { getAllUsers } from "@/services/user-service";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoginPage() {
  const { isVerified, setIsVerified } = useAdminVerification();
  const [isCheckingRoles, setIsCheckingRoles] = useState(true);

  useEffect(() => {
    async function checkSuperAdmin() {
        // If already verified by token, no need to check again.
        if (isVerified) {
            setIsCheckingRoles(false);
            return;
        }

        try {
            const users = await getAllUsers();
            const superAdminExists = users.some(u => u.role === 'superadmin');
            if (!superAdminExists) {
                // If no superadmin, bypass token verification
                setIsVerified(true);
            }
        } catch (error) {
            console.error("Failed to check for superadmin:", error);
        } finally {
            setIsCheckingRoles(false);
        }
    }
    checkSuperAdmin();
  }, [isVerified, setIsVerified]);
  
  if (isCheckingRoles) {
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

  if (!isVerified) {
    return <TokenVerification />;
  }
    
  return <LoginPageClient isAdminLogin={true} />;
}
