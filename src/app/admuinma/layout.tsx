
'use client';

import { AdminVerificationProvider } from './_components/admin-verification-context';

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminVerificationProvider>{children}</AdminVerificationProvider>;
}
