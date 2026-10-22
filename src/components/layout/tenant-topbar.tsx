"use client";

import { Bell, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "@/lib/location-context";
import { useRouter } from "next/navigation";

export function TenantTopbar() {
  const {
    locations,
    currentLocation,
    selectLocationId,
    canAccessAllLocations,
    isAllLocations,
    isLoadingLocations,
  } = useLocation();
  const router = useRouter();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
          {isLoadingLocations ? (
            <span className="text-xs text-slate-400">Loading branches...</span>
          ) : locations.length > 0 || canAccessAllLocations ? (
            <Select
              value={currentLocation?._id || ""}
              onValueChange={(val) => val && selectLocationId(val)}
            >
              <SelectTrigger className="w-[220px] border-none shadow-none font-medium bg-transparent focus:ring-0 h-auto p-0 text-slate-800 text-sm cursor-pointer">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {canAccessAllLocations && (
                  <SelectItem value="ALL" className="cursor-pointer font-semibold text-blue-700 bg-blue-50/50">
                    🌐 All Locations
                  </SelectItem>
                )}
                {locations.map((loc) => (
                  <SelectItem key={loc._id} value={loc._id} className="cursor-pointer">
                    {loc.name} {loc.code ? `(${loc.code})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-xs text-slate-500 font-medium">Default Location</span>
          )}
        </div>

        {!isAllLocations && currentLocation?.businessDate && (
          <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
            Date: {currentLocation.businessDate}
          </span>
        )}
        {isAllLocations && (
          <span className="text-xs font-medium bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
            Multi-branch View
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button 
          title="Notifications" 
          onClick={() => router.push("/tenant/settings/audit-logs")}
          className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
}
