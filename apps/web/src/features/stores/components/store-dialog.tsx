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
import type { Store, CreateStoreInput } from "../types";

interface StoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingStore: Store | null;
  onSubmit: (data: CreateStoreInput) => void;
  isSubmitting?: boolean;
}

export function StoreDialog({
  open,
  onOpenChange,
  editingStore,
  onSubmit,
  isSubmitting,
}: StoreDialogProps) {
  const [formData, setFormData] = useState<CreateStoreInput>({
    name: "",
    businessMode: "retail",
    address: "",
    taxRate: 0,
    serviceChargeRate: 0,
    isActive: true,
  });

  useEffect(() => {
    if (editingStore) {
      setFormData({
        name: editingStore.name,
        businessMode: editingStore.businessMode,
        address: editingStore.address || "",
        taxRate: editingStore.taxRate || 0,
        serviceChargeRate: editingStore.serviceChargeRate || 0,
        isActive: editingStore.isActive,
      });
    } else {
      setFormData({
        name: "",
        businessMode: "retail",
        address: "",
        taxRate: 0,
        serviceChargeRate: 0,
        isActive: true,
      });
    }
  }, [editingStore, open]);

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
