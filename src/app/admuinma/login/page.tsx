'use client';

import { useState } from "react";
import { LoginPageClient } from "@/app/_components/login-page-client";
import { TokenVerification } from "@/app/admuinma/_components/token-verification";

export default function AdminLoginPage() {
  const [isVerified, setIsVerified] = useState(false);

  if (!isVerified) {
    return <TokenVerification onVerified={() => setIsVerified(true)} />;
  }
  
  return (
    <LoginPageClient isAdminLogin={true} />
  );
}
