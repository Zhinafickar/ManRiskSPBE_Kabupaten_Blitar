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
    // Wait until loading is complete before making routing decisions.
    if (loading) {
      return;
    }

    // If loading is done and there's no user, redirect to login.
    if (!user) {
      router.replace('/login');
    }
    // The case of a user with no profile is handled by the rendering logic below.
  }, [user, loading, router]);

  // The AuthProvider already shows a skeleton while its `loading` is true.
  // This gate prevents rendering the layout until the auth state is resolved.
  if (loading || !user) {
    return null;
  }
  
  // If the user is authenticated but the profile is still being created (due to the race condition),
  // show a "finalizing" screen. The onSnapshot listener in useAuth will update this state.
  if (!userProfile) {
     return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
          <Icons.Logo className="size-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Finalizing profile...</p>
      </div>
    );
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
