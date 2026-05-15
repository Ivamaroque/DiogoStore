"use client";

import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";

export function AppShell({ children }) {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-[1800px]">
          <AppSidebar pathname={pathname} />
          <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
            <AppHeader />
            <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
          </div>
        </div>
        <MobileNav pathname={pathname} />
      </div>
    </ProtectedRoute>
  );
}