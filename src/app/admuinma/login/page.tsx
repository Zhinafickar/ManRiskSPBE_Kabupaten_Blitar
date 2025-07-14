
'use client';

import { LoginPageClient } from "@/app/_components/login-page-client";
import { TokenVerification } from "@/app/admuinma/_components/token-verification";
import { useAdminVerification } from '../_components/admin-verification-context';
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function AdminLoginPage() {
  const { isVerified, setIsVerified } = useAdminVerification();

  return (
    <>
      <Dialog open={!isVerified} onOpenChange={(open) => {
        // Prevent closing the dialog by clicking outside or pressing Escape
        if (open === false && !isVerified) {
          return;
        }
      }}>
        <DialogContent className="sm:max-w-md" hideCloseButton={true}>
          <TokenVerification onVerified={() => setIsVerified(true)} />
        </DialogContent>
      </Dialog>
    
      <LoginPageClient isAdminLogin={true} />
    </>
  );
}
