import React from "react";
import { RetailCategory } from "./types";

interface PosCategoryPillsProps {
  categories: RetailCategory[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export function PosCategoryPills({
  categories,
  selectedCategory,
  onSelectCategory,
}: PosCategoryPillsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      <button
        onClick={() => onSelectCategory("ALL")}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
          selectedCategory === "ALL"
            ? "bg-slate-900 text-white shadow-sm"
            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
        }`}
      >
        All Products
      </button>
      {categories.map((c) => (
        <button
          key={c._id}
          onClick={() => onSelectCategory(c._id)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === c._id
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
