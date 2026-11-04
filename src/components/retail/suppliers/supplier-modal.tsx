"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { RetailSupplier, SupplierFormData } from "./types";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: RetailSupplier | null;
  onSubmit: (formData: SupplierFormData) => Promise<void> | void;
  isSubmitting: boolean;
}

export function SupplierModal(props: SupplierModalProps) {
  if (!props.isOpen) return null;

  const key = props.supplier ? `edit-${props.supplier._id}` : "new-supplier";

  return <SupplierModalInner key={key} {...props} />;
}

function SupplierModalInner({
  isOpen,
  onClose,
  supplier,
  onSubmit,
  isSubmitting,
}: SupplierModalProps) {
  const [formData, setFormData] = useState<SupplierFormData>(() => {
    if (supplier) {
      return {
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        leadTimeDays: supplier.leadTimeDays,
        isActive: supplier.isActive,
      };
    }
    return {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      leadTimeDays: 5,
      isActive: true,
    };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            {supplier ? "Edit Supplier" : "New Supplier"}
          </DialogTitle>
          <DialogDescription>
            {supplier ? "Update vendor details and terms." : "Add a new vendor partner."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-700">Company Name *</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Apex Global Distributors"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-700">Contact Person *</Label>
            <Input
              required
              value={formData.contactPerson}
              onChange={(e) =>
                setFormData({ ...formData, contactPerson: e.target.value })
              }
              placeholder="e.g. Marcus Vance"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-700">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@apex.com"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-700">Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1-555-0199"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-700">Lead Time (Days)</Label>
              <Input
                type="number"
                min="0"
                value={formData.leadTimeDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    leadTimeDays: parseInt(e.target.value, 10) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-700">Status</Label>
              <Select
                value={formData.isActive ? "ACTIVE" : "INACTIVE"}
                onValueChange={(val) =>
                  setFormData({ ...formData, isActive: val === "ACTIVE" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-700">Address / City</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="100 Logistics Way, Suite 400"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : supplier ? (
                "Save Changes"
              ) : (
                "Create Supplier"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

