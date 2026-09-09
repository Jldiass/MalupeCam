import { createContext, useContext } from "react";
import type { AuthUser } from "../types/api";

export interface AuthState {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  can: (permission: string) => boolean;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth requer AuthProvider");
  return value;
}

export function homeFor(user: AuthUser) {
  const destinations: Array<[string, string]> = [
    ["overview.read", "/"],
    ["mosaics.read", "/mosaics"],
    ["cameras.read", "/cameras"],
    ["events.read", "/events"],
    ["users.manage", "/users"],
    ["system.health.read", "/health"],
  ];
  return destinations.find(([permission]) => user.permissions.includes(permission))?.[1] ?? "/no-access";
}
