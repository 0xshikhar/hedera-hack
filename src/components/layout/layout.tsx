"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
        <div className="relative min-h-screen flex flex-col">
          <main className="flex-1 container py-6 md:py-10">
            {children}
          </main>
        </div>
        <Toaster />
    </ThemeProvider>
  );
}
