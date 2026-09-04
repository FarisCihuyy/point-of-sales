"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/ui/button";
import { Input } from "@repo/ui/ui/input";
import { Label } from "@repo/ui/ui/label";
import { Badge } from "@repo/ui/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@repo/ui/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/ui/ui/dialog";
import { apiFetch } from "../../../lib/api";
import type { Product, CreateProductInput, Category, ProductVariant } from "@repo/shared";

type ProductWithDetails = Product & {
  category?: Category | null;
  variants?: ProductVariant[];
};

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithDetails | null>(null);

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

  const { data: products = [], isLoading: isLoadingProducts } = useQuery<ProductWithDetails[]>({
    queryKey: ["products"],
    queryFn: () => apiFetch<ProductWithDetails[]>("/products"),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => apiFetch<Category[]>("/categories"),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProductInput) =>
      apiFetch<Product>("/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductInput> }) =>
      apiFetch<Product>(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/products/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
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
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: ProductWithDetails) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.categoryId ?? null,
      sku: product.sku || "",
      barcode: product.barcode || "",
      basePrice: product.basePrice,
      costPrice: product.costPrice || 0,
      imageUrl: product.imageUrl || "",
      isActive: product.isActive,
      variants: product.variants || [],
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

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
    if (editingProduct?.id) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Produk</h1>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="size-4" />
          <span>Tambah Produk</span>
        </Button>
      </div>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga Jual</TableHead>
              <TableHead>Harga Modal</TableHead>
              <TableHead>SKU / Barcode</TableHead>
              <TableHead>Varian</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingProducts ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Belum ada produk.
                </TableCell>
              </TableRow>
            ) : (
              products.map((prod) => (
                <TableRow key={prod.id}>
                  <TableCell className="font-medium">{prod.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {prod.category?.name || "-"}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {formatCurrency(prod.basePrice)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatCurrency(prod.costPrice || 0)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {prod.barcode || prod.sku || "-"}
                  </TableCell>
                  <TableCell>
                    {prod.variants && prod.variants.length > 0 ? (
                      <Badge variant="outline">{prod.variants.length} Varian</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={prod.isActive ? "success" : "destructive"}>
                      {prod.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleOpenEdit(prod)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (prod.id && confirm("Hapus produk ini?")) {
                            deleteMutation.mutate(prod.id);
                          }
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                onClick={handleCloseDialog}
              >
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
