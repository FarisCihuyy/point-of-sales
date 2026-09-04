"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/ui/button";
import {
  DataTable,
  type DataTableColumnDef,
} from "@repo/ui/components/data-table";
import { useCategories } from "../hooks/use-categories";
import { CategoryDialog } from "./category-dialog";
import type { Category, CreateCategoryInput } from "../types";

export function CategoriesView() {
  const {
    categories,
    isLoading,
    createCategory,
    isCreating,
    updateCategory,
    isUpdating,
    deleteCategory,
  } = useCategories();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleSubmit = (formData: CreateCategoryInput) => {
    if (editingCategory?.id) {
      updateCategory(
        { id: editingCategory.id, data: formData },
        {
          onSuccess: () => setIsDialogOpen(false),
        }
      );
    } else {
      createCategory(formData, {
        onSuccess: () => setIsDialogOpen(false),
      });
    }
  };

  const columns = useMemo<DataTableColumnDef<Category & { id: string }>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nama Kategori",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
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
                if (row.original.id && confirm("Hapus kategori ini?")) {
                  deleteCategory(row.original.id);
                }
              }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [deleteCategory]
  );

  const safeCategories = useMemo(
    () => categories.filter((c): c is Category & { id: string } => !!c.id),
    [categories]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Kategori</h1>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="size-4" />
          <span>Tambah Kategori</span>
        </Button>
      </div>

      <DataTable
        data={safeCategories}
        columns={columns}
        isPending={isLoading}
      />

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingCategory={editingCategory}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
}
