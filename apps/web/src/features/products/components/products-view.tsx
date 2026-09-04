"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/ui/button";
import { Badge } from "@repo/ui/ui/badge";
import {
  DataTable,
  type DataTableColumnDef,
} from "@repo/ui/components/data-table";
import { useProducts } from "../hooks/use-products";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { ProductDialog } from "./product-dialog";
import type {
  ProductWithDetails,
  CreateProductInput,
} from "../types";

export function ProductsView() {
  const {
    products,
    isLoading,
    createProduct,
    isCreating,
    updateProduct,
    isUpdating,
    deleteProduct,
  } = useProducts();

  const { categories } = useCategories();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ProductWithDetails | null>(null);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: ProductWithDetails) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleSubmit = (formData: CreateProductInput) => {
    if (editingProduct?.id) {
      updateProduct(
        { id: editingProduct.id, data: formData },
        {
          onSuccess: () => setIsDialogOpen(false),
        }
      );
    } else {
      createProduct(formData, {
        onSuccess: () => setIsDialogOpen(false),
      });
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const columns = useMemo<
    DataTableColumnDef<ProductWithDetails & { id: string }>[]
  >(
    () => [
      {
        accessorKey: "name",
        header: "Nama",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        id: "category",
        header: "Kategori",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.category?.name || "-"}
          </span>
        ),
      },
      {
        accessorKey: "basePrice",
        header: "Harga Jual",
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {formatCurrency(row.original.basePrice)}
          </span>
        ),
      },
      {
        accessorKey: "costPrice",
        header: "Harga Modal",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatCurrency(row.original.costPrice || 0)}
          </span>
        ),
      },
      {
        id: "code",
        header: "SKU / Barcode",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.barcode || row.original.sku || "-"}
          </span>
        ),
      },
      {
        id: "variants",
        header: "Varian",
        cell: ({ row }) =>
          row.original.variants && row.original.variants.length > 0 ? (
            <Badge variant="outline">
              {row.original.variants.length} Varian
            </Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "success" : "destructive"}>
            {row.original.isActive ? "Aktif" : "Nonaktif"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Aksi",
        meta: { className: "text-right" },
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => handleOpenEdit(row.original)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                if (row.original.id && confirm("Hapus produk ini?")) {
                  deleteProduct(row.original.id);
                }
              }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [deleteProduct]
  );

  const safeProducts = useMemo(
    () =>
      products.filter(
        (p): p is ProductWithDetails & { id: string } => !p.id ? false : true
      ),
    [products]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Produk</h1>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="size-4" />
          <span>Tambah Produk</span>
        </Button>
      </div>

      <DataTable
        data={safeProducts}
        columns={columns}
        isPending={isLoading}
      />

      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingProduct={editingProduct}
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
}
