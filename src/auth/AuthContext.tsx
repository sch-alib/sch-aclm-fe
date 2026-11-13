import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiClient, setApiAccessToken } from "../api/client";
import type { AuthUser } from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedValue = localStorage.getItem("certificate-automation-auth");
    return storedValue ? JSON.parse(storedValue) : null;
  });

  useEffect(() => {
    setApiAccessToken(user?.access_token);
  }, [user]);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      async login(username: string, password: string) {
        const response = await apiClient.post<AuthUser>("/auth/login", {
          username,
          password,
        });
        setUser(response.data);
        localStorage.setItem(
          "certificate-automation-auth",
          JSON.stringify(response.data),
        );
      },
      logout() {
        setUser(null);
        localStorage.removeItem("certificate-automation-auth");
        setApiAccessToken();
      },
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be called inside AuthProvider");
  }
  return value;
}
