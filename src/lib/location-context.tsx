"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

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
  const { user } = useAuth();
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
    try {
      const res = await apiClient.get<TenantLocation[]>("/location");
      const list = Array.isArray(res.data) ? res.data : [];
      setLocations(list);

      const savedId = typeof window !== "undefined" ? localStorage.getItem("activeLocationId") : null;

      let selected: TenantLocation | null = null;
      if (savedId === ALL_LOCATIONS_ID) {
        if (canAccessAllLocations) {
          selected = ALL_LOCATIONS_OBJECT;
        } else if (list.length > 0) {
          selected = list[0];
        }
      } else if (savedId) {
        selected = list.find((l) => l._id === savedId) || null;
        if (!selected && list.length > 0) {
          selected = list[0];
        }
      } else if (list.length > 0) {
        selected = list[0];
      }

      setCurrentLocationState(selected);
      if (typeof window !== "undefined" && selected) {
        localStorage.setItem("activeLocationId", selected._id);
      }
    } catch (err) {
      console.error("Failed to load locations:", err);
    } finally {
      setIsLoadingLocations(false);
    }
  }, [user, canAccessAllLocations]);

  useEffect(() => {
    refreshLocations();
  }, [refreshLocations]);

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
    const found = locations.find((l) => l._id === locationId);
    if (found) {
      setCurrentLocation(found);
    }
  };

  const isAllLocations = currentLocation?._id === ALL_LOCATIONS_ID;

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
