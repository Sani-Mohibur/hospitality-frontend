import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Tag, Edit2, Trash2, Loader2 } from "lucide-react";
import { RetailCategory } from "./types";

interface CategoriesTableProps {
  categories: RetailCategory[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onToggleStatus: (category: RetailCategory) => void;
  onOpenEdit: (category: RetailCategory) => void;
  onDelete: (id: string, name: string) => void;
}

export function CategoriesTable({
  categories,
  isLoading,
  searchQuery,
  onSearchChange,
  onToggleStatus,
  onOpenEdit,
  onDelete,
}: CategoriesTableProps) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search categories by name, code, or description..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-16 text-center">Order</TableHead>
                <TableHead className="w-[200px]">Category Name</TableHead>
                <TableHead className="w-24">Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center w-32">Products</TableHead>
                <TableHead className="text-center w-28">Status</TableHead>
                <TableHead className="text-right w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-sm font-medium">Loading retail categories...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Tag className="h-8 w-8 text-slate-300" />
                      <p className="text-sm font-medium">
                        {searchQuery
                          ? "No categories found matching your query"
                          : "No retail categories created yet"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category._id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="text-center font-mono text-xs text-slate-500">
                      {category.sortOrder}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{category.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs bg-slate-50 text-slate-700">
                        {category.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 max-w-md truncate">
                      {category.description || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                        {category.productCount} items
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => onToggleStatus(category)}
                        className="inline-flex items-center"
                        title="Click to toggle status"
                      >
                        {category.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer">
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                          >
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
                          onClick={() => onOpenEdit(category)}
                          title="Edit Category"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => onDelete(category._id, category.name)}
                          title="Delete Category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

