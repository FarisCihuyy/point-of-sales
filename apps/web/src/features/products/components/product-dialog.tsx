"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@repo/ui/ui/button";
import { Input } from "@repo/ui/ui/input";
import { Label } from "@repo/ui/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/ui/ui/dialog";
import type {
  ProductWithDetails,
  CreateProductInput,
  Category,
  ProductVariant,
} from "../types";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: ProductWithDetails | null;
  categories: Category[];
  onSubmit: (data: CreateProductInput) => void;
  isSubmitting?: boolean;
}

export function ProductDialog({
  open,
  onOpenChange,
  editingProduct,
  categories,
  onSubmit,
  isSubmitting,
}: ProductDialogProps) {
  const [formData, setFormData] = useState<CreateProductInput>({
    name: "",
    categoryId: null,
    sku: "",
    barcode: "",
    basePrice: 0,
    costPrice: 0,
    imageUrl: "",
    isActive: true,
    variants: [],
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        categoryId: editingProduct.categoryId ?? null,
        sku: editingProduct.sku || "",
        barcode: editingProduct.barcode || "",
        basePrice: editingProduct.basePrice,
        costPrice: editingProduct.costPrice || 0,
        imageUrl: editingProduct.imageUrl || "",
        isActive: editingProduct.isActive,
        variants: editingProduct.variants || [],
      });
    } else {
      setFormData({
        name: "",
        categoryId: categories[0]?.id ?? null,
        sku: "",
        barcode: "",
        basePrice: 0,
        costPrice: 0,
        imageUrl: "",
        isActive: true,
        variants: [],
      });
    }
  }, [editingProduct, categories, open]);

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...(formData.variants || []),
        { name: "", priceAdjustment: 0, sku: "", isActive: true },
      ],
    });
  };

  const handleRemoveVariant = (index: number) => {
    const updated = [...(formData.variants || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, variants: updated });
  };

  const handleVariantChange = (
    index: number,
    field: keyof ProductVariant,
    value: unknown
  ) => {
    const updated = [...(formData.variants || [])];
    updated[index] = { ...updated[index]!, [field]: value };
    setFormData({ ...formData, variants: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Produk" : "Tambah Produk"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-3">
            <div className="space-y-1">
              <Label htmlFor="prodName">Nama Produk</Label>
              <Input
                id="prodName"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="prodCategory">Kategori</Label>
              <select
                id="prodCategory"
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                value={formData.categoryId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categoryId: e.target.value ? e.target.value : null,
                  })
                }
              >
                <option value="">Tanpa Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="basePrice">Harga Jual (Rp)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  min="0"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      basePrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="costPrice">Harga Modal (Rp)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  min="0"
                  value={formData.costPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      costPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={formData.barcode || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Varian Produk</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={handleAddVariant}
                >
                  + Tambah Varian
                </Button>
              </div>

              {formData.variants && formData.variants.length > 0 && (
                <div className="space-y-2">
                  {formData.variants.map((variant, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 border border-border/70 rounded-md bg-muted/20"
                    >
                      <Input
                        placeholder="Nama Varian"
                        className="h-8 text-xs"
                        value={variant.name}
                        onChange={(e) =>
                          handleVariantChange(idx, "name", e.target.value)
                        }
                        required
                      />
                      <Input
                        type="number"
                        placeholder="Penyesuaian Harga"
                        className="h-8 text-xs w-28"
                        value={variant.priceAdjustment || 0}
                        onChange={(e) =>
                          handleVariantChange(
                            idx,
                            "priceAdjustment",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive"
                        onClick={() => handleRemoveVariant(idx)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
