
'use client';

import { createContext, useState, useContext, ReactNode } from 'react';

interface AdminVerificationContextType {
  isVerified: boolean;
  setIsVerified: (isVerified: boolean) => void;
}

const AdminVerificationContext = createContext<AdminVerificationContextType | undefined>(undefined);

export function AdminVerificationProvider({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);

  return (
    <AdminVerificationContext.Provider value={{ isVerified, setIsVerified }}>
      {children}
    </AdminVerificationContext.Provider>
  );
}

export function useAdminVerification() {
  const context = useContext(AdminVerificationContext);
  if (context === undefined) {
    throw new Error('useAdminVerification must be used within an AdminVerificationProvider');
  }
  return context;
}

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminVerificationProvider>{children}</AdminVerificationProvider>;
}
