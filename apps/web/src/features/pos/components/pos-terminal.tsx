"use client";

import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { posDb, usePosDb } from "@/lib/db";
import { usePosCart } from "../hooks/use-pos-cart";
import { PosHeader } from "./pos-header";
import { CategoryBar } from "./category-bar";
import { ProductGrid } from "./product-grid";
import { CartPanel } from "./cart-panel";
import { Skeleton } from "@repo/ui/ui/skeleton";

export function PosTerminal() {
  const { isOnline, syncNow } = usePosDb();
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Live query reactive data from IndexedDB
  const categories = useLiveQuery(() => posDb.categories.toArray(), []) ?? [];
  const products = useLiveQuery(() => posDb.products.toArray(), []) ?? [];
  const variants = useLiveQuery(() => posDb.productVariants.toArray(), []) ?? [];

  // Active shopping cart hook
  const {
    items: cartItems,
    summary: cartSummary,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  } = usePosCart(0.1, 0); // Default 10% tax

  // Manual trigger sync
  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await syncNow();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCheckout = () => {
    // Siap dihubungkan dengan Checkout Modal di Task #3
    console.log("Proceeding to checkout with items:", cartItems, cartSummary);
    alert(
      `Order dibuat dengan ${cartSummary.itemCount} item!\nTotal: Rp ${cartSummary.grandTotal.toLocaleString(
        "id-ID"
      )}\n(Siap diproses di Modul Checkout Task 3)`
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navbar */}
      <PosHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isOnline={isOnline}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Main Terminal Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left / Center Catalog Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-5">
          {/* Horizontal Category Filter Bar */}
          <CategoryBar
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />

          {/* Product Catalog Grid */}
          <ProductGrid
            products={products}
            variants={variants}
            selectedCategoryId={selectedCategoryId}
            searchQuery={searchQuery}
            onAddToCart={addItem}
          />
        </main>

        {/* Right Interactive Cart Panel */}
        <CartPanel
          items={cartItems}
          summary={cartSummary}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onClearCart={clearCart}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  );
}
