"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store,
  Users,
  Layers,
  Package,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

const navigation = [
  { name: "Outlet", href: "/stores", icon: Store },
  { name: "Karyawan", href: "/users", icon: Users },
  { name: "Kategori", href: "/categories", icon: Layers },
  { name: "Produk", href: "/products", icon: Package },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-sidebar flex flex-col min-h-screen">
      <div className="h-14 flex items-center px-5 border-b border-border font-semibold text-sidebar-foreground tracking-tight">
        POS SaaS
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground font-semibold"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="size-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
