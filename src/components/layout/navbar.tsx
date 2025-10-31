"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Database, Plus, Shield, User, Server, TrendingUp, ChevronDown, Menu, MessageSquare, BarChart3, FolderOpen } from "lucide-react";
import { HederaConnectButton } from "@/components/wallet/HederaConnectButton";
import Image from "next/image";

const navItems = [
  {
    name: "Marketplace",
    href: "/marketplace",
    icon: Database,
  },
  {
    name: "Providers",
    href: "/providers",
    icon: Server,
  },
  {
    name: "Create",
    href: "/create",
    icon: Plus,
  },
  {
    name: "AI Chat",
    href: "/chat",
    icon: MessageSquare,
  },
];

const profileMenuItems = [
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    name: "My Datasets",
    href: "/mydatasets",
    icon: FolderOpen,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Verifiable AI",
    href: "/verifiable-ai",
    icon: BarChart3,
  },
  {
    name: "Verify",
    href: "/verify/dashboard",
    icon: Shield,
  },
  {
    name: "Run Node",
    href: "/run-node",
    icon: Server,
  },
  {
    name: "DePIN Analytics",
    href: "/depin-analytics",
    icon: TrendingUp,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isProfileMenuActive = profileMenuItems.some(item => pathname === item.href);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4 md:px-6 flex h-16 items-center justify-between space-x-4 sm:space-x-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="Logo" width={35} height={35} />
            <span className="font-bold text-2xl">FileThetic</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-foreground/80",
                pathname === item.href
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              <item.icon className="mr-1 h-4 w-4" />
              {item.name}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-foreground/80 px-0",
                  isProfileMenuActive
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                <User className="mr-1 h-4 w-4" />
                Profile
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {profileMenuItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center cursor-pointer",
                      pathname === item.href && "bg-accent"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <HederaConnectButton />
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center text-base font-medium transition-colors hover:text-foreground/80 py-2",
                      pathname === item.href
                        ? "text-foreground"
                        : "text-foreground/60"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}

                <div className="border-t pt-4 mt-2">
                  <p className="text-sm font-semibold mb-3 text-muted-foreground">Profile</p>
                  {profileMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center text-base font-medium transition-colors hover:text-foreground/80 py-2",
                        pathname === item.href
                          ? "text-foreground"
                          : "text-foreground/60"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="border-t pt-4 mt-4 flex items-center gap-2">
                  <HederaConnectButton />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
