"use client";

import { AppSidebar } from "@repo/ui/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui/components/ui/sidebar";
import { Separator } from "@repo/ui/components/ui/separator";
import { useAuth } from "@/features/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  const currentUser = user
    ? {
        name: user.name,
        email: user.email,
        avatar: "",
      }
    : undefined;

  return (
    <SidebarProvider>
      <AppSidebar user={currentUser} onLogout={() => logout()} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          {user && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground uppercase font-semibold text-[10px] tracking-wider">
                {user.role}
              </span>
            </div>
          )}
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
