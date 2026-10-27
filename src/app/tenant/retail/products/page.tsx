"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Package,
  Barcode,
  Tag,
  CheckCircle2,
  XCircle,
  Percent,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import {
  mockProducts,
  mockCategories,
  RetailProduct,
  RetailProductVariant,
  formatMinor,
} from "@/lib/retail-mock-data";

export default function RetailProductsPage() {
  const [products, setProducts] = useState<RetailProduct[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modals state
  const [viewProduct, setViewProduct] = useState<RetailProduct | null>(null);
  const [editProduct, setEditProduct] = useState<RetailProduct | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: mockCategories[0]?._id || "",
    sku: "",
    barcode: "",
    price: "",
    costPrice: "",
    taxCategory: "STANDARD",
    unitOfMeasure: "PIECE",
    tags: "",
    hasVariants: false,
    isActive: true,
  });

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "ALL" || p.categoryId === selectedCategory;

      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "ACTIVE" ? p.isActive : !p.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  const openCreateDialog = () => {
    setFormData({
      name: "",
      description: "",
      categoryId: mockCategories[0]?._id || "",
      sku: `PROD-${Date.now().toString().slice(-4)}`,
      barcode: "",
      price: "",
      costPrice: "",
      taxCategory: "STANDARD",
      unitOfMeasure: "PIECE",
      tags: "",
      hasVariants: false,
      isActive: true,
    });
    setIsCreateOpen(true);
  };

  const openEditDialog = (product: RetailProduct) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      categoryId: product.categoryId,
      sku: product.sku,
      barcode: product.barcode || "",
      price: (product.priceMinor / 100).toFixed(2),
      costPrice: (product.costPriceMinor / 100).toFixed(2),
      taxCategory: product.taxCategory,
      unitOfMeasure: product.unitOfMeasure,
      tags: product.tags.join(", "),
      hasVariants: product.hasVariants,
      isActive: product.isActive,
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const category = mockCategories.find((c) => c._id === formData.categoryId);
    const priceMinor = Math.round(parseFloat(formData.price || "0") * 100);
    const costPriceMinor = Math.round(parseFloat(formData.costPrice || "0") * 100);
    const tagsArray = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p._id === editProduct._id
            ? {
                ...p,
                name: formData.name,
                description: formData.description,
                categoryId: formData.categoryId,
                categoryName: category?.name || "General",
                sku: formData.sku,
                barcode: formData.barcode || undefined,
                priceMinor,
                costPriceMinor,
                taxCategory: formData.taxCategory,
                unitOfMeasure: formData.unitOfMeasure,
                tags: tagsArray,
                hasVariants: formData.hasVariants,
                isActive: formData.isActive,
              }
            : p
        )
      );
      setEditProduct(null);
    } else {
      const newProduct: RetailProduct = {
        _id: `p-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        categoryName: category?.name || "General",
        sku: formData.sku,
        barcode: formData.barcode || undefined,
        priceMinor,
        costPriceMinor,
        taxCategory: formData.taxCategory,
        unitOfMeasure: formData.unitOfMeasure,
        tags: tagsArray,
        hasVariants: formData.hasVariants,
        variants: [],
        isActive: formData.isActive,
        createdAt: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      setIsCreateOpen(false);
    }
  };

  const toggleProductStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const calculateMargin = (priceMinor: number, costPriceMinor: number) => {
    if (priceMinor <= 0) return 0;
    return (((priceMinor - costPriceMinor) / priceMinor) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products Catalog</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your retail product listings, barcodes, variants, and pricing.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary/90 text-white gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Products</p>
              <h3 className="text-xl font-bold text-slate-900">{products.length}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active Items</p>
              <h3 className="text-xl font-bold text-slate-900">
                {products.filter((p) => p.isActive).length}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">With Variants</p>
              <h3 className="text-xl font-bold text-slate-900">
                {products.filter((p) => p.hasVariants).length}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Categories</p>
              <h3 className="text-xl font-bold text-slate-900">{mockCategories.length}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, SKU, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 w-full"
              />
            </div>
            <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
              <div className="w-full sm:w-48">
                <Select value={selectedCategory} onValueChange={(val) => val && setSelectedCategory(val)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    {mockCategories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-36">
                <Select value={selectedStatus} onValueChange={(val) => val && setSelectedStatus(val)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(searchQuery || selectedCategory !== "ALL" || selectedStatus !== "ALL") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("ALL");
                    setSelectedStatus("ALL");
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[280px]">Product / SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-center">Variants</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-36 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Package className="h-8 w-8 text-slate-300" />
                      <p className="text-sm font-medium">No products match your search or filter</p>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("ALL");
                          setSelectedStatus("ALL");
                        }}
                      >
                        Reset filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const margin = calculateMargin(product.priceMinor, product.costPriceMinor);
                  return (
                    <TableRow key={product._id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell>
                        <div className="font-semibold text-slate-900">{product.name}</div>
                        <div className="text-xs font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                          <span>{product.sku}</span>
                          {product.unitOfMeasure && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                              {product.unitOfMeasure}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-50 font-normal text-slate-700">
                          {product.categoryName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.barcode ? (
                          <span className="text-xs font-mono text-slate-600 flex items-center gap-1">
                            <Barcode className="h-3 w-3 text-slate-400" />
                            {product.barcode}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-900">
                        {formatMinor(product.priceMinor)}
                      </TableCell>
                      <TableCell className="text-right text-slate-600">
                        {formatMinor(product.costPriceMinor)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                            Number(margin) >= 40
                              ? "bg-emerald-50 text-emerald-700"
                              : Number(margin) >= 20
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {margin}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {product.hasVariants ? (
                          <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                            {product.variants.length} Variants
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">Single</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => toggleProductStatus(product._id)}
                          className="inline-flex items-center"
                          title="Click to toggle status"
                        >
                          {product.isActive ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer">
                              Inactive
                            </Badge>
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-600 hover:text-slate-900"
                            onClick={() => setViewProduct(product)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-600 hover:text-slate-900"
                            onClick={() => openEditDialog(product)}
                            title="Edit Product"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* View Product Details Modal */}
      <Dialog open={!!viewProduct} onOpenChange={(open) => !open && setViewProduct(null)}>
        <DialogContent className="max-w-2xl">
          {viewProduct && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold text-slate-900">
                    {viewProduct.name}
                  </DialogTitle>
                  <Badge className={viewProduct.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}>
                    {viewProduct.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <DialogDescription>
                  SKU: <span className="font-mono font-medium text-slate-700">{viewProduct.sku}</span> | Category: {viewProduct.categoryName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">Selling Price</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">
                      {formatMinor(viewProduct.priceMinor)}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">Cost Price</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">
                      {formatMinor(viewProduct.costPriceMinor)}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">Profit Margin</p>
                    <p className="text-lg font-bold text-emerald-600 mt-0.5">
                      {calculateMargin(viewProduct.priceMinor, viewProduct.costPriceMinor)}%
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-500 font-medium">Description: </span>
                    <span className="text-slate-700">{viewProduct.description || "No description provided."}</span>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <span className="text-slate-500 font-medium">Barcode: </span>
                      <span className="font-mono text-slate-700">{viewProduct.barcode || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Tax Category: </span>
                      <span className="text-slate-700">{viewProduct.taxCategory}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Unit: </span>
                      <span className="text-slate-700">{viewProduct.unitOfMeasure}</span>
                    </div>
                  </div>
                  {viewProduct.tags && viewProduct.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-slate-500 font-medium">Tags: </span>
                      {viewProduct.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Variants List if present */}
                {viewProduct.hasVariants && viewProduct.variants.length > 0 && (
                  <div className="border-t border-slate-200 pt-3">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Product Variants</h4>
                    <div className="rounded-md border border-slate-200 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead className="text-xs">Variant Name</TableHead>
                            <TableHead className="text-xs">SKU</TableHead>
                            <TableHead className="text-xs text-right">Price</TableHead>
                            <TableHead className="text-xs text-right">Cost</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {viewProduct.variants.map((v) => (
                            <TableRow key={v._id}>
                              <TableCell className="text-xs font-medium text-slate-800">{v.name}</TableCell>
                              <TableCell className="text-xs font-mono text-slate-500">{v.sku}</TableCell>
                              <TableCell className="text-xs text-right font-medium">{formatMinor(v.priceMinor)}</TableCell>
                              <TableCell className="text-xs text-right text-slate-500">{formatMinor(v.costPriceMinor)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    const toEdit = viewProduct;
                    setViewProduct(null);
                    openEditDialog(toEdit);
                  }}
                  className="gap-1.5"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Product
                </Button>
                <Button onClick={() => setViewProduct(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create / Edit Product Modal */}
      <Dialog
        open={isCreateOpen || !!editProduct}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditProduct(null);
          }
        }}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
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

          <form onSubmit={handleSaveProduct} className="space-y-4 py-2">
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
                    {mockCategories.map((c) => (
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
                    <SelectItem value="STANDARD">Standard (10%)</SelectItem>
                    <SelectItem value="FOOD">Reduced Food (5%)</SelectItem>
                    <SelectItem value="EXEMPT">Tax Exempt (0%)</SelectItem>
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
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditProduct(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                {editProduct ? "Save Changes" : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
