"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { mockRetailLocations } from "@/lib/retail-mock-data";

export interface TenantLocation {
  _id: string;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  currency?: string;
  businessDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  branchType?: "HOSPITALITY" | "RESTAURANT" | "RETAIL";
  hasRooms?: boolean;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  mapUrl?: string;
  isActive?: boolean;
}

export const ALL_LOCATIONS_ID = "ALL";
export const ALL_LOCATIONS_OBJECT: TenantLocation = {
  _id: ALL_LOCATIONS_ID,
  name: "All Locations",
  code: "ALL",
};

export const ALL_LOCATIONS_HOSPITALITY_ID = "ALL_HOSPITALITY";
export const ALL_LOCATIONS_HOSPITALITY_OBJECT: TenantLocation = {
  _id: ALL_LOCATIONS_HOSPITALITY_ID,
  name: "All Locations · Hospitality",
  code: "ALL_HOSP",
  branchType: "HOSPITALITY",
};

export const ALL_LOCATIONS_RESTAURANT_ID = "ALL_RESTAURANT";
export const ALL_LOCATIONS_RESTAURANT_OBJECT: TenantLocation = {
  _id: ALL_LOCATIONS_RESTAURANT_ID,
  name: "All Locations · Restaurant",
  code: "ALL_REST",
  branchType: "RESTAURANT",
};

export const ALL_LOCATIONS_RETAIL_ID = "ALL_RETAIL";
export const ALL_LOCATIONS_RETAIL_OBJECT: TenantLocation = {
  _id: ALL_LOCATIONS_RETAIL_ID,
  name: "All Locations · Retail",
  code: "ALL_RET",
  branchType: "RETAIL",
};

export const defaultMockLocations: TenantLocation[] = [
  {
    _id: "loc-hosp-1",
    name: "Grand Hotel",
    code: "HTL-01",
    branchType: "HOSPITALITY",
    hasRooms: true,
    businessDate: "2026-11-01",
    isActive: true,
  },
  {
    _id: "loc-rest-1",
    name: "Bistro & Lounge",
    code: "RST-01",
    branchType: "RESTAURANT",
    hasRooms: false,
    businessDate: "2026-11-01",
    isActive: true,
  },
  ...mockRetailLocations,
];

export function getLocationDisplayName(loc: TenantLocation | null | undefined): string {
  if (!loc) return "Select Location";
  if (loc._id === ALL_LOCATIONS_ID) return "All Locations";
  if (loc._id === ALL_LOCATIONS_HOSPITALITY_ID) return "All Locations · Hospitality";
  if (loc._id === ALL_LOCATIONS_RESTAURANT_ID) return "All Locations · Restaurant";
  if (loc._id === ALL_LOCATIONS_RETAIL_ID) return "All Locations · Retail";
  const typeLabel =
    loc.branchType === "RETAIL"
      ? "Retail"
      : loc.branchType === "HOSPITALITY" || (!loc.branchType && loc.hasRooms)
      ? "Hospitality"
      : "Restaurant";
  return `${loc.name} · ${typeLabel}`;
}

function resolveLocationList(
  apiData: TenantLocation[] | null | undefined,
  hasRetailSub: boolean
): TenantLocation[] {
  const list = Array.isArray(apiData) ? apiData : [];
  if (list.length > 0) {
    const hasRetail = list.some((l) => l.branchType === "RETAIL");
    if (!hasRetail && hasRetailSub) {
      return [...list, ...mockRetailLocations];
    }
    return list;
  }
  return hasRetailSub
    ? defaultMockLocations
    : defaultMockLocations.filter((l) => l.branchType !== "RETAIL");
}

function resolveSelectedLocation(
  list: TenantLocation[],
  savedId: string | null,
  canAccessAllLocations: boolean
): TenantLocation | null {
  if (savedId === ALL_LOCATIONS_ID) {
    if (canAccessAllLocations) return ALL_LOCATIONS_OBJECT;
    return list.length > 0 ? list[0] : null;
  }
  if (savedId === ALL_LOCATIONS_HOSPITALITY_ID) {
    if (canAccessAllLocations) return ALL_LOCATIONS_HOSPITALITY_OBJECT;
    return list.length > 0 ? list[0] : null;
  }
  if (savedId === ALL_LOCATIONS_RESTAURANT_ID) {
    if (canAccessAllLocations) return ALL_LOCATIONS_RESTAURANT_OBJECT;
    return list.length > 0 ? list[0] : null;
  }
  if (savedId === ALL_LOCATIONS_RETAIL_ID) {
    if (canAccessAllLocations) return ALL_LOCATIONS_RETAIL_OBJECT;
    return list.length > 0 ? list[0] : null;
  }
  if (savedId) {
    const found = list.find((l) => l._id === savedId);
    if (found) return found;
    return list.length > 0 ? list[0] : null;
  }
  if (canAccessAllLocations) return ALL_LOCATIONS_OBJECT;
  return list.length > 0 ? list[0] : null;
}

interface LocationContextType {
  locations: TenantLocation[];
  currentLocation: TenantLocation | null;
  setCurrentLocation: (loc: TenantLocation | null) => void;
  selectLocationId: (locationId: string | null | undefined) => void;
  isAllLocations: boolean;
  canAccessAllLocations: boolean;
  isLoadingLocations: boolean;
  refreshLocations: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { user, tenant } = useAuth();
  const [locations, setLocations] = useState<TenantLocation[]>([]);
  const [currentLocation, setCurrentLocationState] = useState<TenantLocation | null>(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  const canAccessAllLocations = Boolean(
    user?.role === "SUPER_ADMIN" ||
    user?.role === "TENANT_OWNER" ||
    user?.allLocations
  );

  const refreshLocations = useCallback(async () => {
    if (!user || user.role === "SUPER_ADMIN") {
      setIsLoadingLocations(false);
      return;
    }
    setIsLoadingLocations(true);
    const hasRetailSub = !tenant?.subscribedModules || tenant.subscribedModules.includes("RETAIL");
    try {
      const res = await apiClient.get<TenantLocation[]>("/location");
      const list = resolveLocationList(res.data, hasRetailSub);
      setLocations(list);

      const savedId = typeof window !== "undefined" ? localStorage.getItem("activeLocationId") : null;
      const selected = resolveSelectedLocation(list, savedId, canAccessAllLocations);
      setCurrentLocationState(selected);
      if (typeof window !== "undefined" && selected) {
        localStorage.setItem("activeLocationId", selected._id);
      }
    } catch (err) {
      console.warn("Could not load locations from API, utilizing fallback locations:", err);
      const list = resolveLocationList(null, hasRetailSub);
      setLocations(list);

      const savedId = typeof window !== "undefined" ? localStorage.getItem("activeLocationId") : null;
      const selected = resolveSelectedLocation(list, savedId, canAccessAllLocations);
      setCurrentLocationState(selected);
      if (typeof window !== "undefined" && selected) {
        localStorage.setItem("activeLocationId", selected._id);
      }
    } finally {
      setIsLoadingLocations(false);
    }
  }, [user, tenant, canAccessAllLocations]);

  useEffect(() => {
    if (!user || user.role === "SUPER_ADMIN") {
      const timer = setTimeout(() => {
        setIsLoadingLocations(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    let ignore = false;
    const hasRetailSub = !tenant?.subscribedModules || tenant.subscribedModules.includes("RETAIL");

    apiClient
      .get<TenantLocation[]>("/location")
      .then((res) => {
        if (!ignore) {
          const list = resolveLocationList(res.data, hasRetailSub);
          setLocations(list);

          const savedId = typeof window !== "undefined" ? localStorage.getItem("activeLocationId") : null;
          const selected = resolveSelectedLocation(list, savedId, canAccessAllLocations);
          setCurrentLocationState(selected);
          if (typeof window !== "undefined" && selected) {
            localStorage.setItem("activeLocationId", selected._id);
          }
          setIsLoadingLocations(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.warn("Could not load locations from API, utilizing fallback locations:", err);
          const list = resolveLocationList(null, hasRetailSub);
          setLocations(list);

          const savedId = typeof window !== "undefined" ? localStorage.getItem("activeLocationId") : null;
          const selected = resolveSelectedLocation(list, savedId, canAccessAllLocations);
          setCurrentLocationState(selected);
          if (typeof window !== "undefined" && selected) {
            localStorage.setItem("activeLocationId", selected._id);
          }
          setIsLoadingLocations(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [user, tenant, canAccessAllLocations]);

  const setCurrentLocation = (loc: TenantLocation | null) => {
    if (!loc || loc._id === ALL_LOCATIONS_ID) {
      if (canAccessAllLocations) {
        setCurrentLocationState(ALL_LOCATIONS_OBJECT);
        if (typeof window !== "undefined") {
          localStorage.setItem("activeLocationId", ALL_LOCATIONS_ID);
        }
      }
      return;
    }
    if (loc._id === ALL_LOCATIONS_HOSPITALITY_ID) {
      if (canAccessAllLocations) {
        setCurrentLocationState(ALL_LOCATIONS_HOSPITALITY_OBJECT);
        if (typeof window !== "undefined") {
          localStorage.setItem("activeLocationId", ALL_LOCATIONS_HOSPITALITY_ID);
        }
      }
      return;
    }
    if (loc._id === ALL_LOCATIONS_RESTAURANT_ID) {
      if (canAccessAllLocations) {
        setCurrentLocationState(ALL_LOCATIONS_RESTAURANT_OBJECT);
        if (typeof window !== "undefined") {
          localStorage.setItem("activeLocationId", ALL_LOCATIONS_RESTAURANT_ID);
        }
      }
      return;
    }
    if (loc._id === ALL_LOCATIONS_RETAIL_ID) {
      if (canAccessAllLocations) {
        setCurrentLocationState(ALL_LOCATIONS_RETAIL_OBJECT);
        if (typeof window !== "undefined") {
          localStorage.setItem("activeLocationId", ALL_LOCATIONS_RETAIL_ID);
        }
      }
      return;
    }

    setCurrentLocationState(loc);
    if (typeof window !== "undefined") {
      localStorage.setItem("activeLocationId", loc._id);
    }
  };

  const selectLocationId = (locationId: string | null | undefined) => {
    if (!locationId) return;
    if (locationId === ALL_LOCATIONS_ID) {
      if (canAccessAllLocations) {
        setCurrentLocation(ALL_LOCATIONS_OBJECT);
      }
      return;
    }
    if (locationId === ALL_LOCATIONS_HOSPITALITY_ID) {
      if (canAccessAllLocations) {
        setCurrentLocation(ALL_LOCATIONS_HOSPITALITY_OBJECT);
      }
      return;
    }
    if (locationId === ALL_LOCATIONS_RESTAURANT_ID) {
      if (canAccessAllLocations) {
        setCurrentLocation(ALL_LOCATIONS_RESTAURANT_OBJECT);
      }
      return;
    }
    if (locationId === ALL_LOCATIONS_RETAIL_ID) {
      if (canAccessAllLocations) {
        setCurrentLocation(ALL_LOCATIONS_RETAIL_OBJECT);
      }
      return;
    }
    const found = locations.find((l) => l._id === locationId);
    if (found) {
      setCurrentLocation(found);
    }
  };

  const isAllLocations =
    currentLocation?._id === ALL_LOCATIONS_ID ||
    currentLocation?._id === ALL_LOCATIONS_HOSPITALITY_ID ||
    currentLocation?._id === ALL_LOCATIONS_RESTAURANT_ID ||
    currentLocation?._id === ALL_LOCATIONS_RETAIL_ID;

  return (
    <LocationContext.Provider
      value={{
        locations,
        currentLocation,
        setCurrentLocation,
        selectLocationId,
        isAllLocations,
        canAccessAllLocations,
        isLoadingLocations,
        refreshLocations,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
