"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { CartItem, CartSummary } from "../types";
import type { LocalProduct, LocalProductVariant } from "@/lib/db";

const CART_STORAGE_KEY = "pos_active_cart_draft";

export function usePosCart(taxRate = 0.1, serviceChargeRate = 0) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load saved cart:", e);
      }
    }
    return [];
  });

  // Persist cart to localStorage for resilience
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to persist cart:", e);
    }
  }, [items]);

  const addItem = useCallback(
    (product: LocalProduct, variant?: LocalProductVariant | null) => {
      setItems((prev) => {
        const lineId = variant ? `${product.id}_${variant.id}` : product.id;
        const existingIndex = prev.findIndex((item) => item.id === lineId);
        const unitPrice = (product.basePrice || 0) + (variant?.priceAdjustment || 0);

        if (existingIndex > -1) {
          const updated = [...prev];
          const current = updated[existingIndex]!;
          updated[existingIndex] = {
            ...current,
            quantity: current.quantity + 1,
          };
          return updated;
        }

        return [
          ...prev,
          {
            id: lineId,
            productId: product.id,
            variantId: variant?.id ?? null,
            name: product.name,
            variantName: variant?.name ?? null,
            unitPrice,
            quantity: 1,
          },
        ];
      });
    },
    []
  );

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.id !== id);
      }
      return prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  const summary: CartSummary = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const taxTotal = Math.round(subtotal * taxRate);
    const serviceChargeTotal = Math.round(subtotal * serviceChargeRate);
    const grandTotal = subtotal + taxTotal + serviceChargeTotal;

    return {
      itemCount,
      subtotal,
      taxRate,
      taxTotal,
      serviceChargeRate,
      serviceChargeTotal,
      grandTotal,
    };
  }, [items, taxRate, serviceChargeRate]);

  return {
    items,
    summary,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
