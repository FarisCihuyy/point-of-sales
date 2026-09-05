"use client";

import React from "react";
import { useAuth } from "@/features/auth";
import { Button } from "@repo/ui/ui/button";
import { Input } from "@repo/ui/ui/input";
import { Badge } from "@repo/ui/ui/badge";
import {
  Search,
  Plus,
  TableProperties,
  Wifi,
  WifiOff,
  RefreshCw,
  LogOut,
  Store,
} from "lucide-react";
import Link from "next/link";

interface PosHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isOnline: boolean;
  onSync: () => void;
  isSyncing?: boolean;
}

export function PosHeader({
  searchQuery,
  onSearchChange,
  isOnline,
  onSync,
  isSyncing = false,
}: PosHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xs px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Brand & Terminal Identity */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold tracking-tight shadow-xs">
          <Store className="size-5" />
        </div>
        <div>
          <h1 className="text-base lg:text-lg font-bold tracking-tight leading-none">
            Pos System
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <span
              className={`size-1.5 rounded-full ${
                isOnline ? "bg-emerald-500 animate-pulse" : "bg-destructive"
              }`}
            />
            {isOnline ? "Online Terminal" : "Offline Mode"}
          </p>
        </div>
      </div>

      {/* Center Search & Quick Actions */}
      <div className="flex-1 max-w-xl flex items-center gap-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search menu or barcode..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 bg-background/80 border-border/80 text-sm focus-visible:ring-1"
          />
        </div>

        {/* Quick Link to Admin Products (for Owner/Manager) */}
        {user && (user.role === "owner" || user.role === "manager") && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1.5 shrink-0 hidden sm:inline-flex"
          >
            <Link href="/products">
              <Plus className="size-3.5" />
              <span>Add Product</span>
            </Link>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs gap-1.5 shrink-0 hidden md:inline-flex"
        >
          <TableProperties className="size-3.5" />
          <span>Tables</span>
        </Button>
      </div>

      {/* Right User & Sync Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onSync}
          disabled={isSyncing}
          title="Sinkronisasi Katalog & Transaksi"
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`size-4 ${isSyncing ? "animate-spin" : ""}`} />
        </Button>

        <div className="hidden lg:flex flex-col items-end text-right px-2">
          <span className="text-xs font-semibold leading-none">{user?.name || "Kasir"}</span>
          <span className="text-[10px] text-muted-foreground uppercase font-mono mt-0.5">
            {user?.role || "Staff"}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout()}
          className="h-8 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="size-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </div>
    </header>
  );
}
