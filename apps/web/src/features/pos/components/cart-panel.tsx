"use client";

import type { CartItem, CartSummary } from "../types";
import { getLucideIconForName, getIconAccent } from "../lib/icon-mapper";
import { Button } from "@repo/ui/ui/button";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";

interface CartPanelProps {
  items: CartItem[];
  summary: CartSummary;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export function CartPanel({
  items,
  summary,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: CartPanelProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isEmpty = items.length === 0;

  return (
    <aside className="w-full lg:w-[380px] xl:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      {/* Cart Top Header */}
      <div className="p-4 border-b border-border/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold tracking-tight">Your Cart</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {summary?.itemCount || 0} item
          </span>
        </div>

        {!isEmpty && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onClearCart}
            className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1 h-7 px-2"
          >
            <Trash2 className="size-3.5" />
            <span>Kosongkan</span>
          </Button>
        )}
      </div>

      {/* Cart Items List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-border/40">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <div className="size-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3 text-muted-foreground/80">
              <ShoppingBag className="size-7" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Keranjang Kosong
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Ketuk atau klik produk dari katalog untuk menambah pesanan.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const Icon = getLucideIconForName(item.name);
            const accent = getIconAccent(item.productId);
            const lineTotal = item.unitPrice * item.quantity;

            return (
              <div
                key={item.id}
                className="pt-3 first:pt-0 flex items-center gap-3"
              >
                {/* Visual Icon Thumbnail */}
                <div
                  className={`size-11 rounded-lg shrink-0 flex items-center justify-center ${accent.bg} ${accent.text}`}
                >
                  <Icon className="size-5" />
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <h4
                    className="text-xs font-semibold text-foreground truncate"
                    title={item.name}
                  >
                    {item.name}
                  </h4>
                  {item.variantName && (
                    <span className="text-[10px] text-muted-foreground block truncate">
                      {item.variantName}
                    </span>
                  )}
                  <div className="text-xs font-bold text-foreground mt-0.5">
                    {formatCurrency(lineTotal)}
                  </div>
                </div>

                {/* Quantity Stepper ( - 1 + ) */}
                <div className="flex items-center border border-border rounded-lg bg-background p-0.5 shrink-0 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="size-6 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-semibold font-mono">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="size-6 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Calculation & Checkout Area */}
      <div className="p-4 border-t border-border bg-card/80 backdrop-blur-xs space-y-3">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-mono text-foreground font-medium">
              {formatCurrency(summary.subtotal)}
            </span>
          </div>

          <div className="flex justify-between text-muted-foreground">
            <span>Tax ({(summary.taxRate * 100).toFixed(0)}%)</span>
            <span className="font-mono text-foreground font-medium">
              {formatCurrency(summary.taxTotal)}
            </span>
          </div>

          {summary.serviceChargeTotal > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Service Charge</span>
              <span className="font-mono text-foreground font-medium">
                {formatCurrency(summary.serviceChargeTotal)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-border/80 flex justify-between items-center text-sm font-bold">
            <span className="text-foreground">Total</span>
            <span className="text-base text-primary font-mono font-bold">
              {formatCurrency(summary.grandTotal)}
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <Button
          type="button"
          size="lg"
          disabled={isEmpty}
          onClick={onCheckout}
          className="w-full h-11 text-sm font-semibold gap-2 shadow-xs cursor-pointer"
        >
          <UtensilsCrossed className="size-4" />
          <span>Create Order</span>
        </Button>
      </div>
    </aside>
  );
}
