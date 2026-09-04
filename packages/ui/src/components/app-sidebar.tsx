"use client"

import * as React from "react"
import {
  Store,
  Users,
  Layers,
  Package,
  Command,
} from "lucide-react"

import { NavMain } from "@repo/ui/components/nav-main"
import { NavUser } from "@repo/ui/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/ui/sidebar"

const data = {
  user: {
    name: "Owner",
    email: "owner@pos.saas",
    avatar: "",
  },
  navMain: [
    {
      title: "Outlet",
      url: "/stores",
      icon: Store,
      isActive: true,
    },
    {
      title: "Karyawan",
      url: "/users",
      icon: Users,
    },
    {
      title: "Kategori",
      url: "/categories",
      icon: Layers,
    },
    {
      title: "Produk",
      url: "/products",
      icon: Package,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/stores">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">POS SaaS</span>
                  <span className="truncate text-xs text-muted-foreground">Backoffice</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
