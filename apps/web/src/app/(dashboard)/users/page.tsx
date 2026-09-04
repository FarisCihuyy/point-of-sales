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
import type { User, CreateUserInput, Store } from "@repo/shared";

const roleLabels: Record<string, string> = {
  owner: "Owner",
  manager: "Manajer",
  cashier: "Kasir",
  waitstaff: "Waitstaff",
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<CreateUserInput>({
    name: "",
    email: "",
    password: "",
    storeId: null,
    role: "cashier",
    pin: "",
    isActive: true,
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => apiFetch<User[]>("/users"),
  });

  const { data: stores = [] } = useQuery<Store[]>({
    queryKey: ["stores"],
    queryFn: () => apiFetch<Store[]>("/stores"),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) =>
      apiFetch<User>("/users", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateUserInput> }) =>
      apiFetch<User>(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/users/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      storeId: stores[0]?.id ?? null,
      role: "cashier",
      pin: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      storeId: user.storeId ?? null,
      role: user.role,
      pin: user.pin || "",
      isActive: user.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser?.id) {
      updateMutation.mutate({ id: editingUser.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getStoreName = (storeId?: string | null) => {
    if (!storeId) return "Semua Outlet";
    const store = stores.find((s) => s.id === storeId);
    return store?.name || "-";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Karyawan</h1>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="size-4" />
          <span>Tambah Karyawan</span>
        </Button>
      </div>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Outlet</TableHead>
              <TableHead>PIN</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingUsers ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Belum ada karyawan.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "owner" ? "default" : "secondary"}>
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getStoreName(user.storeId)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {user.pin ? "••••" : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "success" : "destructive"}>
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleOpenEdit(user)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (user.id && confirm("Hapus karyawan ini?")) {
                            deleteMutation.mutate(user.id);
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
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit Karyawan" : "Tambah Karyawan"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-3">
              <div className="space-y-1">
                <Label htmlFor="userName">Nama Lengkap</Label>
                <Input
                  id="userName"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="userEmail">Email</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              {!editingUser && (
                <div className="space-y-1">
                  <Label htmlFor="userPassword">Password</Label>
                  <Input
                    id="userPassword"
                    type="password"
                    value={formData.password || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="userRole">Role</Label>
                  <select
                    id="userRole"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as CreateUserInput["role"],
                      })
                    }
                  >
                    <option value="owner">Owner</option>
                    <option value="manager">Manajer</option>
                    <option value="cashier">Kasir</option>
                    <option value="waitstaff">Waitstaff</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="userPin">PIN Kasir (4-6 Digit)</Label>
                  <Input
                    id="userPin"
                    type="password"
                    maxLength={6}
                    value={formData.pin || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, pin: e.target.value })
                    }
                    placeholder="1234"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="userStore">Penugasan Outlet</Label>
                <select
                  id="userStore"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.storeId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storeId: e.target.value ? e.target.value : null,
                    })
                  }
                >
                  <option value="">Semua Outlet (Global)</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
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
