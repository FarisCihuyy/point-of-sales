import { LoginForm } from "@/features/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | Point of Sales",
  description: "Masuk ke Dashboard Backoffice POS",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 md:p-8 bg-background">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
