"use client";

import React from "react";
import type { LocalProduct, LocalProductVariant } from "@/lib/db";
import { getLucideIconForName, getIconAccent } from "../lib/icon-mapper";
import { Plus, ShoppingCart } from "lucide-react";
import { Button } from "@repo/ui/ui/button";

interface ProductCardProps {
  product: LocalProduct;
  variants?: LocalProductVariant[];
  onAddToCart: (product: LocalProduct, variant?: LocalProductVariant | null) => void;
}

export function ProductCard({
  product,
  variants = [],
  onAddToCart,
}: ProductCardProps) {
  const Icon = getLucideIconForName(product.name);
  const accent = getIconAccent(product.id);

  // Format currency (IDR or standard currency)
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(product.basePrice);

  return (
    <div
      onClick={() => onAddToCart(product, variants.length > 0 ? variants[0] : null)}
      className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-3 shadow-2xs hover:border-primary/50 hover:shadow-sm transition-all duration-150 cursor-pointer select-none"
    >
      {/* Visual Product Area (Lucide Icon or Image) */}
      <div className="relative aspect-4/3 w-full rounded-lg overflow-hidden flex items-center justify-center bg-muted/40 group-hover:bg-muted/60 transition-colors mb-3">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`flex size-14 items-center justify-center rounded-2xl ${accent.bg} ${accent.text} group-hover:scale-110 transition-transform duration-200 shadow-2xs`}
          >
            <Icon className="size-7" />
          </div>
        )}

        {/* Variant Indicator if any */}
        {variants.length > 0 && (
          <span className="absolute top-2 right-2 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-background/90 backdrop-blur-xs border border-border text-foreground">
            {variants.length} Varian
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="space-y-1">
        <h3
          className="text-sm font-semibold text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors"
          title={product.name}
        >
          {product.name}
        </h3>
        {product.sku && (
          <p className="text-[10px] font-mono text-muted-foreground line-clamp-1">
            {product.sku}
          </p>
        )}
      </div>

      {/* Price & Action Button */}
      <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase font-medium">
            Harga
          </span>
          <span className="text-sm font-bold text-foreground">
            {formattedPrice}
          </span>
        </div>

        <Button
          type="button"
          size="icon-xs"
          variant="secondary"
          className="size-7 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product, variants.length > 0 ? variants[0] : null);
          }}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
