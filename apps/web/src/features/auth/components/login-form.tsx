"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/ui/button";
import { Input } from "@repo/ui/ui/input";
import { Label } from "@repo/ui/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/ui/card";
import { useAuth } from "../hooks/use-auth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginEmail, isLoggingInEmail, loginEmailError } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    loginEmail({ email, password });
  };

  return (
    <Card className="w-full border-border/80 shadow-xs">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl font-semibold tracking-tight">
          Login Backoffice
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Masuk dengan akun Owner atau Manajer untuk mengelola outlet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {loginEmailError && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {(loginEmailError as Error).message || "Gagal masuk. Periksa email dan password."}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="owner@outlet.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium">
                Password
              </Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="h-10 text-sm font-mono"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-10 font-medium"
            disabled={isLoggingInEmail}
          >
            {isLoggingInEmail ? "Memverifikasi..." : "Masuk ke Dashboard"}
          </Button>

          <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border/60">
            Staff / Kasir POS?{" "}
            <Link
              href="/pos/login"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              Masuk dengan PIN Kasir &rarr;
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
