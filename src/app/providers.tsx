"use client";

import { AuthProvider } from "@/hooks/use-auth";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <SidebarProvider>
                {children}
                <Toaster />
            </SidebarProvider>
        </AuthProvider>
    );
}
