"use client";

import { AuthProvider } from "@/hooks/use-auth";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                <SidebarProvider>
                    {children}
                    <Toaster />
                </SidebarProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
