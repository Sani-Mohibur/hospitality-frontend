import { apiFetch } from "./api";

export const apiClient = {
  async get<T = any>(
    endpoint: string,
    options?: { params?: Record<string, any> }
  ): Promise<{ data: T; meta?: any }> {
    let url = endpoint;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          searchParams.append(key, String(val));
        }
      });
      const qs = searchParams.toString();
      if (qs) {
        url += (url.includes("?") ? "&" : "?") + qs;
      }
    }
    const res = await apiFetch(url, { method: "GET" });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Failed to fetch data");
    }
    return json;
  },

  async post<T = any>(endpoint: string, body?: any): Promise<{ data: T; meta?: any }> {
    const res = await apiFetch(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Request failed");
    }
    return json;
  },

  async patch<T = any>(endpoint: string, body?: any): Promise<{ data: T; meta?: any }> {
    const res = await apiFetch(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Request failed");
    }
    return json;
  },

  async delete<T = any>(endpoint: string): Promise<{ data: T; meta?: any }> {
    const res = await apiFetch(endpoint, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Request failed");
    }
    return json;
  },
};
