"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/ui/button";
import { Badge } from "@repo/ui/ui/badge";
import {
  DataTable,
  type DataTableColumnDef,
} from "@repo/ui/components/data-table";
import { useUsers } from "../hooks/use-users";
import { useStores } from "@/features/stores/hooks/use-stores";
import { UserDialog } from "./user-dialog";
import type { User, CreateUserInput, Store } from "../types";

export function UsersView() {
  const {
    users,
    isLoading,
    createUser,
    isCreating,
    updateUser,
    isUpdating,
    deleteUser,
  } = useUsers();

  const { stores } = useStores();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleSubmit = (formData: CreateUserInput) => {
    if (editingUser?.id) {
      updateUser(
        { id: editingUser.id, data: formData },
        {
          onSuccess: () => setIsDialogOpen(false),
        }
      );
    } else {
      createUser(formData, {
        onSuccess: () => setIsDialogOpen(false),
      });
    }
  };

  const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
    owner: "default",
    manager: "secondary",
    cashier: "outline",
    waitstaff: "outline",
  };

  const columns = useMemo<DataTableColumnDef<User & { id: string }>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nama",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.email}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant={roleBadgeVariant[row.original.role] || "outline"}>
            {row.original.role.toUpperCase()}
          </Badge>
        ),
      },
      {
        accessorKey: "storeId",
        header: "Outlet",
        cell: ({ row }) => {
          const store = (stores as Store[]).find((s: Store) => s.id === row.original.storeId);
          return (
            <span className="text-muted-foreground">
              {store ? store.name : "Global"}
            </span>
          );
        },
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
                if (row.original.id && confirm("Hapus pengguna ini?")) {
                  deleteUser(row.original.id);
                }
              }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [deleteUser, stores]
  );

  const safeUsers = useMemo(
    () => (users as User[]).filter((u: User): u is User & { id: string } => !!u.id),
    [users]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Karyawan</h1>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="size-4" />
          <span>Tambah Karyawan</span>
        </Button>
      </div>

      <DataTable data={safeUsers} columns={columns} isPending={isLoading} />

      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingUser={editingUser}
        stores={stores}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
}
