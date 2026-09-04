"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/ui/button";
import { Badge } from "@repo/ui/ui/badge";
import {
  DataTable,
  type DataTableColumnDef,
} from "@repo/ui/components/data-table";
import { useStores } from "../hooks/use-stores";
import { StoreDialog } from "./store-dialog";
import type { Store, CreateStoreInput } from "../types";

export function StoresView() {
  const {
    stores,
    isLoading,
    createStore,
    isCreating,
    updateStore,
    isUpdating,
    deleteStore,
  } = useStores();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  const handleOpenCreate = () => {
    setEditingStore(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (store: Store) => {
    setEditingStore(store);
    setIsDialogOpen(true);
  };

  const handleSubmit = (formData: CreateStoreInput) => {
    if (editingStore?.id) {
      updateStore(
        { id: editingStore.id, data: formData },
        {
          onSuccess: () => setIsDialogOpen(false),
        }
      );
    } else {
      createStore(formData, {
        onSuccess: () => setIsDialogOpen(false),
      });
    }
  };

  const columns = useMemo<DataTableColumnDef<Store & { id: string }>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nama Outlet",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "businessMode",
        header: "Mode",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.businessMode === "resto" ? "secondary" : "outline"
            }
          >
            {row.original.businessMode.toUpperCase()}
          </Badge>
        ),
      },
      {
        accessorKey: "address",
        header: "Alamat",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.address || "-"}
          </span>
        ),
      },
      {
        accessorKey: "taxRate",
        header: "Pajak (%)",
        cell: ({ row }) => `${row.original.taxRate}%`,
      },
      {
        accessorKey: "serviceChargeRate",
        header: "Service (%)",
        cell: ({ row }) => `${row.original.serviceChargeRate}%`,
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
                if (row.original.id && confirm("Hapus outlet ini?")) {
                  deleteStore(row.original.id);
                }
              }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [deleteStore]
  );

  const safeStores = useMemo(
    () => (stores as Store[]).filter((s: Store): s is Store & { id: string } => !!s.id),
    [stores]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Outlet</h1>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="size-4" />
          <span>Tambah Outlet</span>
        </Button>
      </div>

      <DataTable data={safeStores} columns={columns} isPending={isLoading} />

      <StoreDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingStore={editingStore}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
}
