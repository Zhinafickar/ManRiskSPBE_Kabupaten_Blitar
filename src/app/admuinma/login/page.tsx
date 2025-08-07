
'use client';

import { LoginPageClient } from "@/app/_components/login-page-client";

export default function AdminLoginPage() {
  // Directly render the login client without any verification logic.
  return <LoginPageClient isAdminLogin={true} />;
}
