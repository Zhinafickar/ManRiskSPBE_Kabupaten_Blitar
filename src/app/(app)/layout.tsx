'use client';

import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Icons } from '@/components/icons';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (!userProfile) {
        // This state can happen if a user is in Auth but their Firestore doc is missing.
        // Log them out and redirect to login to avoid letting them into a broken state.
        console.error("User authenticated but profile is missing. Forcing logout.");
        if (auth) {
          signOut(auth).finally(() => router.replace('/login'));
        } else {
          router.replace('/login');
        }
      }
    }
  }, [user, userProfile, loading, router]);

  if (loading || !user || !userProfile) {
    // AuthProvider already shows a more detailed skeleton. This is a secondary gate.
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Icons.Logo className="size-6 text-primary" />
            <h1 className="text-lg font-semibold">Risk Navigator</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter>
          {/* Can add footer items here if needed */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                {/* Can add breadcrumbs or page title here */}
            </div>
            <UserNav />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
