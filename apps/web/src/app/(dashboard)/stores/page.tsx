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
import type { Store, CreateStoreInput } from "@repo/shared";

export default function StoresPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  const [formData, setFormData] = useState<CreateStoreInput>({
    name: "",
    businessMode: "retail",
    address: "",
    taxRate: 0,
    serviceChargeRate: 0,
    isActive: true,
  });

  const { data: stores = [], isLoading } = useQuery<Store[]>({
    queryKey: ["stores"],
    queryFn: () => apiFetch<Store[]>("/stores"),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateStoreInput) =>
      apiFetch<Store>("/stores", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateStoreInput> }) =>
      apiFetch<Store>(`/stores/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/stores/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });

  const handleOpenCreate = () => {
    setEditingStore(null);
    setFormData({
      name: "",
      businessMode: "retail",
      address: "",
      taxRate: 0,
      serviceChargeRate: 0,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      businessMode: store.businessMode,
      address: store.address || "",
      taxRate: store.taxRate || 0,
      serviceChargeRate: store.serviceChargeRate || 0,
      isActive: store.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStore(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStore?.id) {
      updateMutation.mutate({ id: editingStore.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Outlet</h1>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="size-4" />
          <span>Tambah Outlet</span>
        </Button>
      </div>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Pajak (%)</TableHead>
              <TableHead>Service (%)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : stores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Belum ada outlet.
                </TableCell>
              </TableRow>
            ) : (
              stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">{store.name}</TableCell>
                  <TableCell>
                    <Badge variant={store.businessMode === "resto" ? "secondary" : "outline"}>
                      {store.businessMode.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {store.address || "-"}
                  </TableCell>
                  <TableCell>{store.taxRate}%</TableCell>
                  <TableCell>{store.serviceChargeRate}%</TableCell>
                  <TableCell>
                    <Badge variant={store.isActive ? "success" : "destructive"}>
                      {store.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleOpenEdit(store)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (store.id && confirm("Hapus outlet ini?")) {
                            deleteMutation.mutate(store.id);
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
                {editingStore ? "Edit Outlet" : "Tambah Outlet"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-3">
              <div className="space-y-1">
                <Label htmlFor="name">Nama Outlet</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="businessMode">Mode Bisnis</Label>
                <select
                  id="businessMode"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.businessMode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessMode: e.target.value as "retail" | "resto",
                    })
                  }
                >
                  <option value="retail">Retail</option>
                  <option value="resto">Resto (F&B)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="taxRate">Pajak (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.taxRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        taxRate: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="serviceChargeRate">Service Charge (%)</Label>
                  <Input
                    id="serviceChargeRate"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.serviceChargeRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        serviceChargeRate: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
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
