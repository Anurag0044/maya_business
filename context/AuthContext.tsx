"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { BackendUser } from "@/components/workspace/types";
import { apiClient } from "@/lib/api";
import { clearSession } from "@/app/actions/auth";

interface AuthContextType {
  user: BackendUser | null;
  isLoading: boolean;
  login: (access_token: string, refresh_token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  const login = async (access_token: string, refresh_token: string) => {
    // Note: HttpOnly cookie should be set by the API route/server action, not here.
    // For local mock/template usage we bypass localStorage.
    try {
      const response = await apiClient.get("/auth/me");
      setUser(response.data || response);
    } catch (e) {
      console.error("Failed to fetch user after login", e);
    }
  };

  const logout = async () => {
    await clearSession();
    setUser(null);
  };

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await apiClient.get("/auth/me");
        setUser(response.data);
      } catch (error) {
        console.error("Auth session verification failed", error);
        if (process.env.NODE_ENV === "development") {
          // Provide safe mock defaults so pages continue to render without crashing
          setUser({
            id: "dev-mock-id",
            name: "Executive User",
            email: "executive@maya.bi",
            role: "admin",
            business_id: "dev-mock-business-id",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
