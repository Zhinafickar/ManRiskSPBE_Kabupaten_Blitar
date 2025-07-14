

'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PanelLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';

function AppLayoutSkeleton() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Mock Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r bg-muted/40 p-4 gap-4">
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
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
          <Skeleton className="h-8 w-8 rounded-md md:hidden" />
          <Skeleton className="h-8 w-8 rounded-full ml-auto" />
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

function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading || !user || !userProfile) {
    return <AppLayoutSkeleton />;
  }

  return <AppLayoutContent>{children}</AppLayoutContent>;
}


export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </SidebarProvider>
  );
}

function AppLayoutContent({ children }: { children: ReactNode }) {
    const { open: sidebarOpen, setOpen: setSidebarOpen, isMobile } = useSidebar();

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen w-full">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r transition-transform duration-300 ease-in-out",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                    // For mobile, the sidebar is handled by a Sheet component,
                    // so we hide the fixed sidebar on mobile.
                    isMobile ? "hidden" : "flex flex-col"
                )}
            >
                 <div className="flex h-14 items-center border-b px-4">
                    <div className="flex items-center gap-2 min-w-0">
                        <Image src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjm96r3FWka5963AzMK6SrYozoB5UTcMNGM2yUF7Isid0BsVcecBHk6lhVBGouTkSfBFuNPW-jPyWW_k2umwKI6sN3frHLk7g1Nd_Ubi0qz_a0G6svusKAmc3hy0-up0RPZGrk-MYnrl5g/s1600/kabupaten-blitar-vector-logo-idngrafis.png" alt="Logo" width={40} height={40} />
                        <h1 className="text-lg font-semibold truncate">Manajemen Risiko</h1>
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="px-3 py-4">
                        <MainNav />
                    </div>
                </ScrollArea>
            </aside>

             {/* Mobile Sidebar - Sheet */}
            {isMobile && (
                 <aside
                    className={cn(
                    "fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r transition-transform duration-300 ease-in-out",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <div className="flex h-full flex-col">
                    <div className="flex h-14 items-center border-b px-4 justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                            <Image src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjm96r3FWka5963AzMK6SrYozoB5UTcMNGM2yUF7Isid0BsVcecBHk6lhVBGouTkSfBFuNPW-jPyWW_k2umwKI6sN3frHLk7g1Nd_Ubi0qz_a0G6svusKAmc3hy0-up0RPZGrk-MYnrl5g/s1600/kabupaten-blitar-vector-logo-idngrafis.png" alt="Logo" width={40} height={40} />
                            <h1 className="text-lg font-semibold truncate">Manajemen Risiko</h1>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={toggleSidebar}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="px-3 py-4">
                            <MainNav />
                        </div>
                    </ScrollArea>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <div
                className={cn(
                    "transition-all duration-300 ease-in-out",
                    sidebarOpen && !isMobile ? "md:pl-64" : "pl-0"
                )}
            >
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSidebar}>
                        <PanelLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1" />
                    <UserNav />
                </header>
                <main className="flex-1 p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
