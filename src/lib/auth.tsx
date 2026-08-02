import { createContext, useContext, useState, type ReactNode } from "react";

export type Role = "student" | "lecturer" | "admin";

const STORAGE_KEY = "tfa_token";

export interface Principal {
  uid: string;
  role: Role;
}

interface AuthState {
  principal: Principal | null;
  token: string | null;
  login: (uid: string, role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

/** Backend `decode_mock_token` expects base64(JSON({uid, role})). */
function encodeToken(principal: Principal): string {
  return btoa(JSON.stringify(principal));
}

function readStoredToken(): { token: string; principal: Principal } | null {
  const token = localStorage.getItem(STORAGE_KEY);
  if (!token) return null;
  try {
    const principal = JSON.parse(atob(token)) as Principal;
    if (!principal.uid || !principal.role) throw new Error("malformed");
    return { token, principal };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(readStoredToken);

  const login = (uid: string, role: Role) => {
    const principal = { uid, role };
    const token = encodeToken(principal);
    localStorage.setItem(STORAGE_KEY, token);
    setState({ token, principal });
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        principal: state?.principal ?? null,
        token: state?.token ?? null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
