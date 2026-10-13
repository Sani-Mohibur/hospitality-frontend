export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
export const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || `${BACKEND_URL}/api/v1`).replace(/\/$/, "");
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || BACKEND_URL;

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function apiFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { requireAuth = true, ...customOptions } = options;
  const headers = new Headers(customOptions.headers);
  headers.set("Content-Type", "application/json");

  if (requireAuth) {
    const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    const locId = typeof window !== 'undefined' ? localStorage.getItem("activeLocationId") : null;
    if (locId && !headers.has("X-Location-Id")) {
      headers.set("X-Location-Id", locId);
    }
  }

  const config: RequestInit = {
    ...customOptions,
    headers,
  };
  
  // Include credentials for refreshToken cookie
  config.credentials = 'include';

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401 && requireAuth && endpoint !== '/auth/login' && endpoint !== '/auth/refresh-token') {
    // Try to refresh token
    try {
      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData.data?.accessToken) {
          localStorage.setItem("accessToken", refreshData.data.accessToken);
          // Retry the original request
          headers.set("Authorization", `Bearer ${refreshData.data.accessToken}`);
          config.headers = headers;
          response = await fetch(`${BASE_URL}${endpoint}`, config);
        } else {
          // Force logout
          localStorage.removeItem("accessToken");
          if (typeof window !== 'undefined') window.location.href = "/login";
        }
      } else {
        localStorage.removeItem("accessToken");
        if (typeof window !== 'undefined') window.location.href = "/login";
      }
    } catch (err) {
      localStorage.removeItem("accessToken");
      if (typeof window !== 'undefined') window.location.href = "/login";
    }
  }

  return response;
}

export { apiClient } from "./api-client";
