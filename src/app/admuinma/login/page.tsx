
'use client';

import { LoginPageClient } from "@/app/_components/login-page-client";
import { TokenVerification } from "@/app/admuinma/_components/token-verification";
import { useAdminVerification } from '../_components/admin-verification-context';

export default function AdminLoginPage() {
  const { isVerified } = useAdminVerification();

  if (!isVerified) {
    return <TokenVerification />;
  }
    
  return <LoginPageClient isAdminLogin={true} />;
}
