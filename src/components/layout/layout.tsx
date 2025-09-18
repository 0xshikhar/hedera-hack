"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

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
          <Navbar />
          <main className="flex-1 container py-6 md:py-10">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster />
    </ThemeProvider>
  );
}
