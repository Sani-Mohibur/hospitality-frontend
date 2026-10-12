import { apiFetch } from "./api";

export const apiClient = {
  async get<T = any>(endpoint: string): Promise<{ data: T; meta?: any }> {
    const res = await apiFetch(endpoint, { method: "GET" });
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
