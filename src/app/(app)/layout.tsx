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
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';

function AppLayoutSkeleton() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Mock Sidebar */}
      <div className="hidden md:flex flex-col w-56 border-r bg-muted/40 p-4 gap-4">
        <div className="flex items-center gap-2 h-10">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
      {/* Mock Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-end gap-4 border-b bg-background px-4 sm:px-6">
          <Skeleton className="h-8 w-8 rounded-full" />
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This handles redirection after the initial auth check is complete.
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // AuthProvider shows a global loading screen, so we don't need to check `loading` here.
  // This component only renders after the initial check.

  // If, after the initial load, there's no user, redirect is imminent.
  // Return null to prevent a brief flash of the layout.
  if (!user) {
    return null;
  }
  
  // If there's a user but the profile is still loading (e.g., during registration race condition),
  // show a dedicated layout skeleton instead of a blank screen. This is the fix.
  if (!userProfile) {
    return <AppLayoutSkeleton />;
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
