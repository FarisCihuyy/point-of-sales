"use client";

import React from "react";
import type { LocalCategory } from "@/lib/db";
import { getLucideIconForName, getIconAccent } from "../lib/icon-mapper";
import { Layers } from "lucide-react";

interface CategoryBarProps {
  categories: LocalCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryBar({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryBarProps) {
  const isAllSelected = selectedCategoryId === null;

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-3 min-w-max">
        {/* "All" Tab Button */}
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`flex flex-col items-center justify-center min-w-[76px] h-20 px-3 py-2 rounded-xl border transition-all duration-150 select-none cursor-pointer ${
            isAllSelected
              ? "border-primary bg-primary/5 text-primary shadow-xs font-semibold ring-2 ring-primary/20"
              : "border-border/80 bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground"
          }`}
        >
          <div
            className={`flex size-9 items-center justify-center rounded-lg mb-1.5 transition-transform ${
              isAllSelected
                ? "bg-primary text-primary-foreground scale-105"
                : "bg-muted text-foreground/80"
            }`}
          >
            <Layers className="size-4" />
          </div>
          <span className="text-xs tracking-tight">All</span>
        </button>

        {/* Dynamic Category Buttons from IndexedDB */}
        {categories.map((cat, idx) => {
          const isSelected = selectedCategoryId === cat.id;
          const Icon = getLucideIconForName(cat.name);
          const accent = getIconAccent(cat.id || idx);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex flex-col items-center justify-center min-w-[80px] h-20 px-3 py-2 rounded-xl border transition-all duration-150 select-none cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/5 text-primary shadow-xs font-semibold ring-2 ring-primary/20"
                  : "border-border/80 bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`flex size-9 items-center justify-center rounded-lg mb-1.5 transition-transform ${
                  isSelected
                    ? "bg-primary text-primary-foreground scale-105"
                    : `${accent.bg} ${accent.text}`
                }`}
              >
                <Icon className="size-4" />
              </div>
              <span className="text-xs tracking-tight truncate max-w-[72px]" title={cat.name}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
