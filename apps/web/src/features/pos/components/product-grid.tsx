"use client";

import React, { useMemo } from "react";
import type { LocalProduct, LocalProductVariant } from "@/lib/db";
import { ProductCard } from "./product-card";
import { PackageSearch, PlusCircle } from "lucide-react";
import { Button } from "@repo/ui/ui/button";
import Link from "next/link";

interface ProductGridProps {
  products: LocalProduct[];
  variants: LocalProductVariant[];
  selectedCategoryId: string | null;
  searchQuery: string;
  onAddToCart: (product: LocalProduct, variant?: LocalProductVariant | null) => void;
}

export function ProductGrid({
  products,
  variants,
  selectedCategoryId,
  searchQuery,
  onAddToCart,
}: ProductGridProps) {
  // Filter products based on active category and search input
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // 1. Check active status
      if (item.isActive === 0) return false;

      // 2. Check category filter
      if (selectedCategoryId !== null && item.categoryId !== selectedCategoryId) {
        return false;
      }

      // 3. Check search query (name, barcode, sku)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(query);
        const matchSku = item.sku ? item.sku.toLowerCase().includes(query) : false;
        const matchBarcode = item.barcode ? item.barcode.toLowerCase().includes(query) : false;
        return matchName || matchSku || matchBarcode;
      }

      return true;
    });
  }, [products, selectedCategoryId, searchQuery]);

  // Group variants by productId
  const variantsMap = useMemo(() => {
    const map = new Map<string, LocalProductVariant[]>();
    for (const v of variants) {
      if (v.isActive === 0) continue;
      const list = map.get(v.productId) || [];
      list.push(v);
      map.set(v.productId, list);
    }
    return map;
  }, [variants]);

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] p-8 text-center rounded-2xl border border-dashed border-border/80 bg-muted/20">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
          <PackageSearch className="size-7" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          Tidak ada produk ditemukan
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
          {searchQuery
            ? `Tidak ada menu atau barcode yang cocok dengan "${searchQuery}".`
            : "Katalog produk di database masih kosong atau belum disinkronkan."}
        </p>

        <Button asChild variant="outline" size="sm" className="text-xs gap-1.5">
          <Link href="/products">
            <PlusCircle className="size-3.5" />
            <span>Kelola Produk di Backoffice</span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 pb-8">
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variants={variantsMap.get(product.id) || []}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
