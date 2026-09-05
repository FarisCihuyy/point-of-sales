"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@repo/ui/ui/input-otp";
import { useAuth } from "../hooks/use-auth";
import { Delete, RotateCcw } from "lucide-react";

export function PinNumpad() {
  const [pin, setPin] = useState("");
  const { loginPin, isLoggingInPin, loginPinError } = useAuth();

  const handleLogin = useCallback(
    (pinValue: string) => {
      if (pinValue.length >= 4 && !isLoggingInPin) {
        loginPin({ pin: pinValue });
      }
    },
    [loginPin, isLoggingInPin]
  );

  const handleKeyPress = useCallback(
    (num: string) => {
      if (isLoggingInPin) return;
      if (pin.length < 6) {
        const nextPin = pin + num;
        setPin(nextPin);
        if (nextPin.length === 6) {
          handleLogin(nextPin);
        }
      }
    },
    [isLoggingInPin, pin, handleLogin]
  );

  const handleBackspace = useCallback(() => {
    if (isLoggingInPin) return;
    setPin((prev) => prev.slice(0, -1));
  }, [isLoggingInPin]);

  const handleClear = useCallback(() => {
    if (isLoggingInPin) return;
    setPin("");
  }, [isLoggingInPin]);

  // Keyboard shortcut listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Escape") {
        handleClear();
      } else if (e.key === "Enter" && pin.length >= 4) {
        handleLogin(pin);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pin, handleLogin, handleKeyPress, handleBackspace, handleClear]);

  return (
    <Card className="w-full max-w-sm border-border/80 shadow-xs mx-auto">
      <CardHeader className="text-center space-y-1 pb-4">
        <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <span className="font-mono text-base font-bold">POS</span>
        </div>
        <CardTitle className="text-xl font-semibold tracking-tight">
          Terminal Kasir
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Masukkan 4-6 digit PIN staff untuk membuka sesi
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {loginPinError && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-center text-xs text-destructive">
            {(loginPinError as Error).message || "PIN kasir salah atau akun dinonaktifkan."}
          </div>
        )}

        {/* Input OTP Visual Slot */}
        <div className="flex justify-center py-1">
          <InputOTP
            maxLength={6}
            value={pin}
            onChange={(val) => {
              setPin(val);
              if (val.length === 6) {
                handleLogin(val);
              }
            }}
            disabled={isLoggingInPin}
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot index={0} className="h-12 w-11 text-lg font-mono rounded-md border" />
              <InputOTPSlot index={1} className="h-12 w-11 text-lg font-mono rounded-md border" />
              <InputOTPSlot index={2} className="h-12 w-11 text-lg font-mono rounded-md border" />
              <InputOTPSlot index={3} className="h-12 w-11 text-lg font-mono rounded-md border" />
              <InputOTPSlot index={4} className="h-12 w-11 text-lg font-mono rounded-md border" />
              <InputOTPSlot index={5} className="h-12 w-11 text-lg font-mono rounded-md border" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* Minimalist Touch Keypad */}
        <div className="grid grid-cols-3 gap-2 px-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <Button
              key={num}
              type="button"
              variant="outline"
              size="lg"
              disabled={isLoggingInPin}
              onClick={() => handleKeyPress(num)}
              className="h-14 text-xl font-mono font-medium active:scale-95 transition-transform border-border/80 hover:bg-accent"
            >
              {num}
            </Button>
          ))}

          <Button
            type="button"
            variant="ghost"
            size="lg"
            disabled={isLoggingInPin || pin.length === 0}
            onClick={handleClear}
            className="h-14 text-xs font-medium text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
            title="Hapus Semua (Esc)"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isLoggingInPin}
            onClick={() => handleKeyPress("0")}
            className="h-14 text-xl font-mono font-medium active:scale-95 transition-transform border-border/80 hover:bg-accent"
          >
            0
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="lg"
            disabled={isLoggingInPin || pin.length === 0}
            onClick={handleBackspace}
            className="h-14 active:scale-95 transition-transform"
            title="Hapus Satu (Backspace)"
          >
            <Delete className="h-5 w-5" />
          </Button>
        </div>

        {/* Action Button */}
        <Button
          type="button"
          className="w-full h-11 font-medium text-sm"
          disabled={pin.length < 4 || isLoggingInPin}
          onClick={() => handleLogin(pin)}
        >
          {isLoggingInPin ? "Memverifikasi PIN..." : "Buka Terminal"}
        </Button>

        <div className="text-center text-xs text-muted-foreground border-t border-border/60 pt-3">
          Owner / Manajer?{" "}
          <Link
            href="/admin/login"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
          >
            Masuk Backoffice &rarr;
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
