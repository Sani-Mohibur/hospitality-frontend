"use client";

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
import { Search, Edit2, Trash2, Mail, Phone, Loader2 } from "lucide-react";
import { RetailSupplier } from "./types";

interface SuppliersTabProps {
  filteredSuppliers: RetailSupplier[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onEditSupplier: (sup: RetailSupplier) => void;
  onDeleteSupplier: (id: string, name: string) => void;
}

export function SuppliersTab({
  filteredSuppliers,
  isLoading,
  searchQuery,
  onSearchChange,
  onEditSupplier,
  onDeleteSupplier,
}: SuppliersTabProps) {
  return (
    <div className="space-y-4">
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search suppliers by name, contact, or email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-center">Lead Time</TableHead>
                <TableHead className="text-center">Products</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span>Loading suppliers...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                    No suppliers found. Click &quot;Add Supplier&quot; to register your first vendor.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((sup) => (
                  <TableRow key={sup._id} className="hover:bg-slate-50/70">
                    <TableCell className="font-semibold text-slate-900">{sup.name}</TableCell>
                    <TableCell className="text-slate-700">{sup.contactPerson || "—"}</TableCell>
                    <TableCell>
                      {sup.email && (
                        <div className="text-xs text-slate-600 flex items-center gap-1">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {sup.email}
                        </div>
                      )}
                      {sup.phone && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {sup.phone}
                        </div>
                      )}
                      {!sup.email && !sup.phone && <span className="text-xs text-slate-400">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                      {sup.address || "—"}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">
                      {sup.leadTimeDays} days
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                        {sup.productsSupplied} items
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {sup.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-600"
                          onClick={() => onEditSupplier(sup)}
                          title="Edit Supplier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:text-rose-700"
                          onClick={() => onDeleteSupplier(sup._id, sup.name)}
                          title="Delete Supplier"
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

