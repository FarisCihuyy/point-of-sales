import React from "react";
import {
  Utensils,
  Pizza,
  Coffee,
  CupSoda,
  Cookie,
  Soup,
  Sandwich,
  Wine,
  Flame,
  Salad,
  Apple,
  Sparkles,
  ShoppingBag,
  Package,
  Layers,
  CakeSlice,
  GlassWater,
  IceCream2,
  Fish,
  Croissant,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps category or product name to a relevant Lucide icon.
 * Returns a tasteful fallback icon if no specific match is found.
 */
export function getLucideIconForName(name: string): LucideIcon {
  const normalized = name.toLowerCase().trim();

  if (normalized.includes("all") || normalized.includes("semua")) return Layers;
  if (normalized.includes("pizza")) return Pizza;
  if (normalized.includes("burger") || normalized.includes("hamburger")) return Sandwich;
  if (normalized.includes("coffee") || normalized.includes("kopi") || normalized.includes("espresso") || normalized.includes("latte")) return Coffee;
  if (normalized.includes("drink") || normalized.includes("minuman") || normalized.includes("beverage") || normalized.includes("soda") || normalized.includes("tea") || normalized.includes("teh")) return CupSoda;
  if (normalized.includes("water") || normalized.includes("mineral")) return GlassWater;
  if (normalized.includes("wine") || normalized.includes("cocktail") || normalized.includes("beer") || normalized.includes("alkohol")) return Wine;
  if (normalized.includes("snack") || normalized.includes("camilan") || normalized.includes("fries") || normalized.includes("kentang") || normalized.includes("chips")) return Cookie;
  if (normalized.includes("pasta") || normalized.includes("spaghetti") || normalized.includes("noodle") || normalized.includes("mie") || normalized.includes("ramen")) return Soup;
  if (normalized.includes("soup") || normalized.includes("sop") || normalized.includes("soto")) return Soup;
  if (normalized.includes("salad") || normalized.includes("sayur") || normalized.includes("vegetable")) return Salad;
  if (normalized.includes("cake") || normalized.includes("kue") || normalized.includes("dessert") || normalized.includes("sweet") || normalized.includes("roti")) return CakeSlice;
  if (normalized.includes("bakery") || normalized.includes("pastry") || normalized.includes("croissant")) return Croissant;
  if (normalized.includes("ice cream") || normalized.includes("es krim") || normalized.includes("gelato")) return IceCream2;
  if (normalized.includes("sauce") || normalized.includes("saus") || normalized.includes("sambal") || normalized.includes("condiment") || normalized.includes("spicy")) return Flame;
  if (normalized.includes("fruit") || normalized.includes("buah") || normalized.includes("juice") || normalized.includes("jus")) return Apple;
  if (normalized.includes("meat") || normalized.includes("daging") || normalized.includes("steak") || normalized.includes("ayam") || normalized.includes("chicken")) return Flame;
  if (normalized.includes("fish") || normalized.includes("seafood") || normalized.includes("ikan")) return Fish;
  if (normalized.includes("retail") || normalized.includes("barang") || normalized.includes("item")) return Package;

  return Utensils;
}

/**
 * Generates an aesthetic soft background & accent color class for product/category visual badges
 */
export function getIconAccent(indexOrId: string | number): {
  bg: string;
  text: string;
} {
  const palettes = [
    { bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
    { bg: "bg-rose-500/10 dark:bg-rose-500/20", text: "text-rose-600 dark:text-rose-400" },
    { bg: "bg-orange-500/10 dark:bg-orange-500/20", text: "text-orange-600 dark:text-orange-400" },
    { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400" },
    { bg: "bg-sky-500/10 dark:bg-sky-500/20", text: "text-sky-600 dark:text-sky-400" },
    { bg: "bg-indigo-500/10 dark:bg-indigo-500/20", text: "text-indigo-600 dark:text-indigo-400" },
    { bg: "bg-violet-500/10 dark:bg-violet-500/20", text: "text-violet-600 dark:text-violet-400" },
    { bg: "bg-pink-500/10 dark:bg-pink-500/20", text: "text-pink-600 dark:text-pink-400" },
  ];

  let num = 0;
  if (typeof indexOrId === "number") {
    num = Math.abs(indexOrId);
  } else {
    for (let i = 0; i < indexOrId.length; i++) {
      num = (num + indexOrId.charCodeAt(i)) % palettes.length;
    }
  }

  return palettes[num % palettes.length]!;
}
