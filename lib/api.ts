export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    // Token is now handled via HttpOnly cookie; browser attaches it automatically
    const headers = new Headers(options.headers || {});
    if (options.method && ["POST", "PUT", "PATCH"].includes(options.method.toUpperCase())) {
      headers.set("Content-Type", "application/json");
    }

    let response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    if (response.status === 401 && typeof window !== "undefined") {
      // With HttpOnly cookies, the backend handles refresh logic via its own endpoints 
      // or middleware, returning 401 if fully expired. We just pass the 401 along.
      console.warn("Unauthorized API call. Session may have expired.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  async get(endpoint: string) {
    return this.fetchWithAuth(endpoint, { method: "GET" });
  }

  async post(endpoint: string, data: any) {
    return this.fetchWithAuth(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(NEXT_PUBLIC_API_URL);
