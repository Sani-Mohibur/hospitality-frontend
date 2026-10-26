"use client";

import React, { useMemo, useEffect } from "react";
import { Bell, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useLocation,
  TenantLocation,
  getLocationDisplayName,
  ALL_LOCATIONS_ID,
  ALL_LOCATIONS_HOSPITALITY_ID,
  ALL_LOCATIONS_RESTAURANT_ID,
} from "@/lib/location-context";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function TenantTopbar() {
  const {
    locations,
    currentLocation,
    selectLocationId,
    canAccessAllLocations,
    isAllLocations,
    isLoadingLocations,
  } = useLocation();
  const { hasModule } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isHospitalityRoute = pathname.startsWith("/tenant/hospitality");
  const isRestaurantRoute = pathname.startsWith("/tenant/restaurant");

  const hasHospitalitySub = hasModule("HOSPITALITY");
  const hasRestaurantSub = hasModule("RESTAURANT");
  const bothSubscribed = hasHospitalitySub && hasRestaurantSub;

  const isHospLoc = (loc: TenantLocation) =>
    loc.branchType === "HOSPITALITY" || (!loc.branchType && loc.hasRooms);
  const isRestLoc = (loc: TenantLocation) =>
    loc.branchType === "RESTAURANT" || (!loc.branchType && !loc.hasRooms);

  const hospitalityBranches = useMemo(
    () => locations.filter(isHospLoc),
    [locations]
  );
  const restaurantBranches = useMemo(
    () => locations.filter(isRestLoc),
    [locations]
  );

  const showAllHospitalityOption =
    canAccessAllLocations && hospitalityBranches.length > 1;
  const showAllRestaurantOption =
    canAccessAllLocations && restaurantBranches.length > 1;

  interface DropdownOption {
    id: string;
    label: string;
    isAll?: boolean;
  }

  const dropdownOptions = useMemo<DropdownOption[]>(() => {
    const options: DropdownOption[] = [];

    if (isHospitalityRoute) {
      if (showAllHospitalityOption) {
        options.push({
          id: ALL_LOCATIONS_HOSPITALITY_ID,
          label: "All Locations · Hospitality",
          isAll: true,
        });
      }
      hospitalityBranches.forEach((b) => {
        options.push({
          id: b._id,
          label: `${b.name} · Hospitality`,
        });
      });
    } else if (isRestaurantRoute) {
      if (showAllRestaurantOption) {
        options.push({
          id: ALL_LOCATIONS_RESTAURANT_ID,
          label: "All Locations · Restaurant",
          isAll: true,
        });
      }
      restaurantBranches.forEach((b) => {
        options.push({
          id: b._id,
          label: `${b.name} · Restaurant`,
        });
      });
    } else {
      // Dashboard, Shared & Settings pages
      if (bothSubscribed) {
        if (canAccessAllLocations) {
          options.push({
            id: ALL_LOCATIONS_ID,
            label: "All Locations",
            isAll: true,
          });
        }
        if (showAllHospitalityOption) {
          options.push({
            id: ALL_LOCATIONS_HOSPITALITY_ID,
            label: "All Locations · Hospitality",
            isAll: true,
          });
        }
        if (showAllRestaurantOption) {
          options.push({
            id: ALL_LOCATIONS_RESTAURANT_ID,
            label: "All Locations · Restaurant",
            isAll: true,
          });
        }
        hospitalityBranches.forEach((b) => {
          options.push({
            id: b._id,
            label: `${b.name} · Hospitality`,
          });
        });
        restaurantBranches.forEach((b) => {
          options.push({
            id: b._id,
            label: `${b.name} · Restaurant`,
          });
        });
      } else {
        // Only one module subscribed
        if (canAccessAllLocations) {
          options.push({
            id: ALL_LOCATIONS_ID,
            label: "All Locations",
            isAll: true,
          });
        }
        if (hasHospitalitySub) {
          hospitalityBranches.forEach((b) => {
            options.push({
              id: b._id,
              label: `${b.name} · Hospitality`,
            });
          });
        } else if (hasRestaurantSub) {
          restaurantBranches.forEach((b) => {
            options.push({
              id: b._id,
              label: `${b.name} · Restaurant`,
            });
          });
        } else {
          locations.forEach((b) => {
            const typeLabel = isHospLoc(b) ? "Hospitality" : "Restaurant";
            options.push({
              id: b._id,
              label: `${b.name} · ${typeLabel}`,
            });
          });
        }
      }
    }

    return options;
  }, [
    isHospitalityRoute,
    isRestaurantRoute,
    showAllHospitalityOption,
    showAllRestaurantOption,
    bothSubscribed,
    canAccessAllLocations,
    hospitalityBranches,
    restaurantBranches,
    hasHospitalitySub,
    hasRestaurantSub,
    locations,
  ]);

  // Keep selected location in sync with valid options for the current page
  useEffect(() => {
    if (isLoadingLocations || dropdownOptions.length === 0) return;

    const currentId = currentLocation?._id;
    const isValid = dropdownOptions.some((opt) => opt.id === currentId);

    if (!isValid) {
      selectLocationId(dropdownOptions[0].id);
    }
  }, [pathname, isLoadingLocations, currentLocation?._id, dropdownOptions, selectLocationId]);

  const selectedDisplayName = getLocationDisplayName(currentLocation);

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
          {isLoadingLocations ? (
            <span className="text-xs text-slate-400">Loading branches...</span>
          ) : dropdownOptions.length > 0 ? (
            <Select
              value={currentLocation?._id || ""}
              onValueChange={(val) => val && selectLocationId(val)}
            >
              <SelectTrigger className="w-auto min-w-[200px] max-w-[320px] border-none shadow-none font-medium bg-transparent focus:ring-0 h-auto p-0 text-slate-800 text-sm cursor-pointer">
                <SelectValue placeholder="Select Location">
                  {() => selectedDisplayName}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {dropdownOptions.map((opt) => (
                  <SelectItem
                    key={opt.id}
                    value={opt.id}
                    className={`cursor-pointer ${opt.isAll ? "font-semibold text-blue-700 bg-blue-50/50" : ""}`}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-xs text-slate-500 font-medium">No locations available</span>
          )}
        </div>

        {!isAllLocations && currentLocation?.businessDate && (
          <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
            Date: {currentLocation.businessDate}
          </span>
        )}
        {currentLocation?._id === ALL_LOCATIONS_ID && (
          <span className="text-xs font-medium bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
            Multi-branch View
          </span>
        )}
        {currentLocation?._id === ALL_LOCATIONS_HOSPITALITY_ID && (
          <span className="text-xs font-medium bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200">
            All Hospitality Branches
          </span>
        )}
        {currentLocation?._id === ALL_LOCATIONS_RESTAURANT_ID && (
          <span className="text-xs font-medium bg-purple-50 text-purple-800 px-2.5 py-1 rounded-full border border-purple-200">
            All Restaurant Branches
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
