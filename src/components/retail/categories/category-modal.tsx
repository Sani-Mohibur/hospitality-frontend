import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { RetailCategory, CategoryFormData } from "./types";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editCategory: RetailCategory | null;
  defaultSortOrder: number;
  onSave: (formData: CategoryFormData, isEditing: boolean) => Promise<void>;
  isSaving: boolean;
}

function CategoryModalInner({
  onClose,
  editCategory,
  defaultSortOrder,
  onSave,
  isSaving,
}: {
  onClose: () => void;
  editCategory: RetailCategory | null;
  defaultSortOrder: number;
  onSave: (formData: CategoryFormData, isEditing: boolean) => Promise<void>;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<CategoryFormData>(() => ({
    name: editCategory ? editCategory.name : "",
    code: editCategory ? editCategory.code : "",
    description: editCategory ? editCategory.description || "" : "",
    sortOrder: editCategory ? editCategory.sortOrder : defaultSortOrder,
    isActive: editCategory ? editCategory.isActive : true,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData, !!editCategory);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-bold text-slate-900">
          {editCategory ? "Edit Category" : "New Category"}
        </DialogTitle>
        <DialogDescription>
          {editCategory
            ? "Update category code, display order, and status."
            : "Create a new category to group related retail products."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="catName" className="text-xs font-medium text-slate-700">
            Category Name *
          </Label>
          <Input
            id="catName"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Health & Beauty"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="catCode" className="text-xs font-medium text-slate-700">
              Code / Short Tag *
            </Label>
            <Input
              id="catCode"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. HLTH"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sortOrder" className="text-xs font-medium text-slate-700">
              Sort Order
            </Label>
            <Input
              id="sortOrder"
              type="number"
              min="1"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({ ...formData, sortOrder: Number(e.target.value) || 1 })
              }
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="catDesc" className="text-xs font-medium text-slate-700">
            Description
          </Label>
          <textarea
            id="catDesc"
            rows={3}
            className="w-full rounded-md border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Category details..."
          />
        </div>

        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
            />
            Category is Active
          </label>
        </div>

        <DialogFooter className="pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-white gap-2"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editCategory ? "Save Changes" : "Create Category"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function CategoryModal({
  isOpen,
  onClose,
  editCategory,
  defaultSortOrder,
  onSave,
  isSaving,
}: CategoryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        {isOpen && (
          <CategoryModalInner
            key={editCategory?._id || "new"}
            onClose={onClose}
            editCategory={editCategory}
            defaultSortOrder={defaultSortOrder}
            onSave={onSave}
            isSaving={isSaving}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

