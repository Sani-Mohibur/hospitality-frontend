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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RetailProduct, RetailCategory, ProductFormData } from "./types";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editProduct: RetailProduct | null;
  categories: RetailCategory[];
  onSave: (formData: ProductFormData, isEditing: boolean) => Promise<void>;
  isSaving: boolean;
}

function ProductFormModalInner({
  onClose,
  editProduct,
  categories,
  onSave,
  isSaving,
}: {
  onClose: () => void;
  editProduct: RetailProduct | null;
  categories: RetailCategory[];
  onSave: (formData: ProductFormData, isEditing: boolean) => Promise<void>;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<ProductFormData>(() => {
    if (editProduct) {
      const catIdStr =
        typeof editProduct.categoryId === "string"
          ? editProduct.categoryId
          : (editProduct.categoryId as { _id?: string })?._id || "";
      return {
        name: editProduct.name,
        description: editProduct.description || "",
        categoryId: catIdStr || categories[0]?._id || "",
        sku: editProduct.sku,
        barcode: editProduct.barcode || "",
        price: (editProduct.priceMinor / 100).toFixed(2),
        costPrice: (editProduct.costPriceMinor / 100).toFixed(2),
        taxCategory: editProduct.taxCategory || "RETAIL",
        unitOfMeasure: editProduct.unitOfMeasure || "PIECE",
        tags: (editProduct.tags || []).join(", "),
        hasVariants: editProduct.hasVariants,
        isActive: editProduct.isActive,
      };
    }
    return {
      name: "",
      description: "",
      categoryId: categories[0]?._id || "",
      sku: `PROD-${Date.now().toString().slice(-4)}`,
      barcode: "",
      price: "",
      costPrice: "",
      taxCategory: "RETAIL",
      unitOfMeasure: "PIECE",
      tags: "",
      hasVariants: false,
      isActive: true,
    };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }
    await onSave(formData, !!editProduct);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-bold text-slate-900">
          {editProduct ? "Edit Product" : "Create New Product"}
        </DialogTitle>
        <DialogDescription>
          {editProduct
            ? "Update product information, pricing, and category."
            : "Fill in the details to add a new product to your inventory."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-medium text-slate-700">
            Product Name *
          </Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Organic Cotton T-Shirt"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="sku" className="text-xs font-medium text-slate-700">
              SKU *
            </Label>
            <Input
              id="sku"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. APRL-OCT-001"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="barcode" className="text-xs font-medium text-slate-700">
              Barcode (UPC / EAN)
            </Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              placeholder="e.g. 8901234567890"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-xs font-medium text-slate-700">
              Category *
            </Label>
            <Select
              value={formData.categoryId}
              onValueChange={(val) => val && setFormData({ ...formData, categoryId: val })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="unit" className="text-xs font-medium text-slate-700">
              Unit of Measure
            </Label>
            <Select
              value={formData.unitOfMeasure}
              onValueChange={(val) => val && setFormData({ ...formData, unitOfMeasure: val })}
            >
              <SelectTrigger id="unit">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIECE">Piece (pcs)</SelectItem>
                <SelectItem value="PACK">Pack</SelectItem>
                <SelectItem value="PAIR">Pair</SelectItem>
                <SelectItem value="KG">Kilogram (kg)</SelectItem>
                <SelectItem value="LITER">Liter (L)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs font-medium text-slate-700">
              Selling Price ($) *
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="29.99"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="costPrice" className="text-xs font-medium text-slate-700">
              Cost Price ($) *
            </Label>
            <Input
              id="costPrice"
              type="number"
              step="0.01"
              required
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              placeholder="14.50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="tax" className="text-xs font-medium text-slate-700">
              Tax Category
            </Label>
            <Select
              value={formData.taxCategory}
              onValueChange={(val) => val && setFormData({ ...formData, taxCategory: val })}
            >
              <SelectTrigger id="tax">
                <SelectValue placeholder="Tax Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RETAIL">Standard Retail (RETAIL)</SelectItem>
                <SelectItem value="FOOD">Food & Beverage (FOOD)</SelectItem>
                <SelectItem value="NONE">Tax Exempt (NONE)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tags" className="text-xs font-medium text-slate-700">
              Tags (comma separated)
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="summer, organic, best-seller"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="desc" className="text-xs font-medium text-slate-700">
            Description
          </Label>
          <textarea
            id="desc"
            className="w-full rounded-md border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Product description and specifications..."
          />
        </div>

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
            />
            Product is Active
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={formData.hasVariants}
              onChange={(e) => setFormData({ ...formData, hasVariants: e.target.checked })}
              className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
            />
            Has Multi-variants (Size/Color)
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
            {editProduct ? "Save Changes" : "Create Product"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function ProductFormModal({
  isOpen,
  onClose,
  editProduct,
  categories,
  onSave,
  isSaving,
}: ProductFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        {isOpen && (
          <ProductFormModalInner
            key={editProduct?._id || "new"}
            onClose={onClose}
            editProduct={editProduct}
            categories={categories}
            onSave={onSave}
            isSaving={isSaving}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

