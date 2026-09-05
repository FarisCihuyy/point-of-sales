import type { LocalProduct, LocalProductVariant } from "@/lib/db";

export interface CartItem {
  id: string; // Unique cart line ID (e.g. productId + (variantId || ""))
  productId: string;
  variantId?: string | null;
  name: string;
  variantName?: string | null;
  unitPrice: number;
  quantity: number;
  notes?: string;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  taxRate: number; // e.g. 0.1 for 10%
  taxTotal: number;
  serviceChargeRate: number;
  serviceChargeTotal: number;
  grandTotal: number;
}
