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
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Icons } from '@/components/icons';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This is now just a safeguard. If AuthProvider finishes loading and there's
    // still no user, it means they are logged out, so we redirect.
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // AuthProvider shows its own loading skeleton. This check prevents rendering
  // the layout with incomplete data during the brief moment before redirection
  // or on initial hydration.
  if (loading || !user || !userProfile) {
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
