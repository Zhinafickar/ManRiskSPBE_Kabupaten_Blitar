
'use client';

import { LoginPageClient } from "@/app/_components/login-page-client";
import { TokenVerification } from "@/app/admuinma/_components/token-verification";
import { useAdminVerification } from '../_components/admin-verification-context';

export default function AdminLoginPage() {
  const { isVerified, setIsVerified } = useAdminVerification();

  if (!isVerified) {
    return <TokenVerification onVerified={() => setIsVerified(true)} />;
  }
    
  return <LoginPageClient isAdminLogin={true} />;
}
