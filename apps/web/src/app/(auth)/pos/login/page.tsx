import { PinNumpad } from "@/features/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "POS Terminal Login | Point of Sales",
  description: "Masukkan PIN staff untuk membuka sesi terminal kasir",
};

export default function PosLoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 md:p-8 bg-background">
      <div className="w-full max-w-sm">
        <PinNumpad />
      </div>
    </div>
  );
}
