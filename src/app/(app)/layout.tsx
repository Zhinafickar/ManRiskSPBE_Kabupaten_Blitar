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
    // Don't do anything while the auth state is initially loading.
    if (loading) {
      return;
    }

    // If loading is done and there's no user, redirect to login.
    if (!user) {
      router.replace('/login');
      return;
    }

    // If there is a user but no profile, this could be a race condition
    // during registration or a genuine error. We'll wait a few seconds.
    if (user && !userProfile) {
      const timer = setTimeout(() => {
        // If the profile is still missing after a delay, it's an error. Force logout.
        console.error("User authenticated but profile is missing. Forcing logout.");
        if (auth) {
          signOut(auth).finally(() => router.replace('/login'));
        } else {
          router.replace('/login');
        }
      }, 5000); // 5-second timeout

      // Clean up the timer if the component unmounts or if the profile loads.
      return () => clearTimeout(timer);
    }
  }, [user, userProfile, loading, router]);

  // The AuthProvider already shows a skeleton while its `loading` is true.
  // This gate prevents rendering the layout until the user is confirmed.
  if (loading || !user) {
    return null;
  }
  
  // If the user is authenticated but the profile is still being created (due to the race condition),
  // show a simple "finalizing" screen instead of the full layout.
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
