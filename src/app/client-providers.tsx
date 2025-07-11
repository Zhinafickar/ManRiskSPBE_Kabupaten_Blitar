"use client";

import { AuthProvider } from "@/hooks/use-auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { ReactNode } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <SidebarProvider>
                {children}
            </SidebarProvider>
        </AuthProvider>
    );
}
