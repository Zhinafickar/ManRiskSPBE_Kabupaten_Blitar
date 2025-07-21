'use client';

import { createContext, useState, useContext, ReactNode } from 'react';

interface AdminVerificationContextType {
  isVerified: boolean;
  setIsVerified: (isVerified: boolean) => void;
  availableRoles: string[] | null;
  setAvailableRoles: (roles: string[] | null) => void;
}

const AdminVerificationContext = createContext<AdminVerificationContextType | undefined>(undefined);

export function AdminVerificationProvider({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[] | null>(null);

  return (
    <AdminVerificationContext.Provider value={{ isVerified, setIsVerified, availableRoles, setAvailableRoles }}>
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
