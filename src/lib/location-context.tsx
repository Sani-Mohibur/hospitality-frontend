"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export interface TenantLocation {
  _id: string;
  name: string;
  code?: string;
  timezone?: string;
  currency?: string;
  businessDate?: string;
  isActive?: boolean;
}

interface LocationContextType {
  locations: TenantLocation[];
  currentLocation: TenantLocation | null;
  setCurrentLocation: (loc: TenantLocation) => void;
  isLoadingLocations: boolean;
  refreshLocations: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [locations, setLocations] = useState<TenantLocation[]>([]);
  const [currentLocation, setCurrentLocationState] = useState<TenantLocation | null>(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

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
      let selected = list.find((l) => l._id === savedId);
      if (!selected && list.length > 0) {
        selected = list[0];
      }

      if (selected) {
        setCurrentLocationState(selected);
        if (typeof window !== "undefined") {
          localStorage.setItem("activeLocationId", selected._id);
        }
      }
    } catch (err) {
      console.error("Failed to load locations:", err);
    } finally {
      setIsLoadingLocations(false);
    }
  }, [user]);

  useEffect(() => {
    refreshLocations();
  }, [refreshLocations]);

  const setCurrentLocation = (loc: TenantLocation) => {
    setCurrentLocationState(loc);
    if (typeof window !== "undefined") {
      localStorage.setItem("activeLocationId", loc._id);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        locations,
        currentLocation,
        setCurrentLocation,
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
