import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut, type User } from "firebase/auth";

// If using Firebase, these should come from VITE_ variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock",
};

const app = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(app);

export interface AuthState {
  user: User | null;
  token: string | null;
  role: string | null;
  loading: boolean;
  mockLogin: (uid: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if we are in Mock mode (no Firebase config provided)
  const isMock = firebaseConfig.apiKey === "mock";

  useEffect(() => {
    if (isMock) {
      // Mock mode: Try to load from localStorage
      const savedToken = localStorage.getItem("mock_token");
      if (savedToken) {
        try {
          const parsed = JSON.parse(atob(savedToken));
          setToken(btoa(JSON.stringify(parsed))); // Re-encode as mock JWT
          setRole(parsed.role);
          // @ts-ignore
          setUser({ uid: parsed.uid, displayName: parsed.uid, email: `${parsed.uid}@fpt.edu.vn` } as User);
        } catch (e) {
          localStorage.removeItem("mock_token");
        }
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (u) => {
      setUser(u);
      if (u) {
        const t = await u.getIdToken();
        const claims = await u.getIdTokenResult();
        setToken(t);
        setRole(claims.claims.role as string || "student");
      } else {
        setToken(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [isMock]);

  function mockLogin(uid: string, role: string) {
    const payload = { uid, role };
    const fakeToken = btoa(JSON.stringify(payload));
    localStorage.setItem("mock_token", fakeToken);
    setToken(fakeToken);
    setRole(role);
    // @ts-ignore
    setUser({ uid, displayName: uid, email: `${uid}@fpt.edu.vn` } as User);
  }

  function logout() {
    if (isMock) {
      localStorage.removeItem("mock_token");
      setToken(null);
      setRole(null);
      setUser(null);
    } else {
      signOut(firebaseAuth);
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, role, loading, mockLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
