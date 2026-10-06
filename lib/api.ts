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

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });
    } catch (networkError) {
      throw new Error(
        `API network error on ${endpoint}: ${
          networkError instanceof Error ? networkError.message : String(networkError)
        }`
      );
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
