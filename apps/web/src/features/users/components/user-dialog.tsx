"use client";

import { useState, useEffect } from "react";
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
import type { User, CreateUserInput, Store } from "../types";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  stores: Store[];
  onSubmit: (data: CreateUserInput) => void;
  isSubmitting?: boolean;
}

export function UserDialog({
  open,
  onOpenChange,
  editingUser,
  stores,
  onSubmit,
  isSubmitting,
}: UserDialogProps) {
  const [formData, setFormData] = useState<CreateUserInput>({
    name: "",
    email: "",
    password: "",
    storeId: null,
    role: "cashier",
    pin: "",
    isActive: true,
  });

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        password: "",
        storeId: editingUser.storeId ?? null,
        role: editingUser.role,
        pin: editingUser.pin || "",
        isActive: editingUser.isActive,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        storeId: stores[0]?.id ?? null,
        role: "cashier",
        pin: "",
        isActive: true,
      });
    }
  }, [editingUser, stores, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
