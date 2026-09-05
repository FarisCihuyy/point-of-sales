"use client";

import { useAuth } from "@/features/auth";
import { Button } from "@repo/ui/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/ui/card";
import { LogOut, ShoppingCart } from "lucide-react";

export default function PosTerminalPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* POS Top Header */}
      <header className="h-14 border-b border-border px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold font-mono text-sm">
            POS
          </div>
          <span className="font-semibold text-sm">Terminal Kasir</span>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="text-right">
              <div className="text-xs font-medium">{user.name}</div>
              <div className="text-[10px] text-muted-foreground uppercase font-mono">{user.role}</div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            Tutup Shift / Keluar
          </Button>
        </div>
      </header>

      {/* POS Content View */}
      <main className="flex-1 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full text-center border-border/80 shadow-xs">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-semibold">Terminal POS Aktif</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Selamat bertugas, {user?.name || "Kasir"}. Modul katalog produk dan keranjang kasir siap dikembangkan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/60 text-xs text-muted-foreground">
              Role akun Anda adalah <span className="font-semibold text-foreground uppercase">{user?.role}</span>. Akses ke Backoffice dibatasi khusus untuk Owner dan Manajer.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
