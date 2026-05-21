"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

// Empty fallback → relative URLs in prod that go through next.config.ts
// rewrites (proxied to Render). Set NEXT_PUBLIC_API_URL=http://localhost:8000
// in .env.local for direct local-backend dev.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type User = {
  id: number;
  email: string;
  business_name: string | null;
};
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type FetcherOpts = RequestInit & { auth?: boolean };

export type Fetcher = (path: string, opts?: FetcherOpts) => Promise<Response>;

type Auth = {
  status: AuthStatus;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    businessName?: string | null
  ) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  fetcher: Fetcher;
};

const Ctx = createContext<Auth | null>(null);

export function useAuth(): Auth {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const accessRef = useRef<string | null>(null);

  const refreshAccess = useCallback(async (): Promise<string | null> => {
    try {
      const r = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!r.ok) return null;
      const { access_token } = (await r.json()) as { access_token: string };
      accessRef.current = access_token;
      return access_token;
    } catch {
      return null;
    }
  }, []);

  const fetcher = useCallback<Fetcher>(
    async (path, opts = {}) => {
      const { auth = true, headers, ...rest } = opts;
      const url = path.startsWith("http") ? path : `${API_URL}${path}`;
      const buildHeaders = (token: string | null) => {
        const h = new Headers(headers);
        if (auth && token) h.set("Authorization", `Bearer ${token}`);
        return h;
      };

      let response = await fetch(url, {
        ...rest,
        credentials: "include",
        headers: buildHeaders(accessRef.current),
      });

      // One automatic retry on 401 by silent refresh — but never for the
      // refresh endpoint itself (would infinite-loop).
      const isRefreshCall = url.endsWith("/api/auth/refresh");
      if (auth && response.status === 401 && !isRefreshCall) {
        const newToken = await refreshAccess();
        if (!newToken) {
          accessRef.current = null;
          setUser(null);
          setStatus("unauthenticated");
          return response;
        }
        response = await fetch(url, {
          ...rest,
          credentials: "include",
          headers: buildHeaders(newToken),
        });
      }
      return response;
    },
    [refreshAccess]
  );

  const fetchMe = useCallback(async (): Promise<boolean> => {
    const r = await fetcher("/api/auth/me");
    if (!r.ok) return false;
    setUser((await r.json()) as User);
    setStatus("authenticated");
    return true;
  }, [fetcher]);

  // On mount: try a silent refresh + /me to restore the session if the
  // user has a valid refresh cookie.
  useEffect(() => {
    let alive = true;
    (async () => {
      const token = await refreshAccess();
      if (!alive) return;
      if (!token) {
        setStatus("unauthenticated");
        return;
      }
      const ok = await fetchMe();
      if (!alive) return;
      if (!ok) setStatus("unauthenticated");
    })();
    return () => {
      alive = false;
    };
  }, [refreshAccess, fetchMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const r = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail ?? "Login failed");
      }
      const { access_token } = (await r.json()) as { access_token: string };
      accessRef.current = access_token;
      await fetchMe();
    },
    [fetchMe]
  );

  const register = useCallback(
    async (email: string, password: string, businessName?: string | null) => {
      const body = businessName?.trim()
        ? { email, password, business_name: businessName.trim() }
        : { email, password };
      const r = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail ?? "Registration failed");
      }
      await login(email, password);
    },
    [login]
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore — clear local state regardless.
    }
    accessRef.current = null;
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const refresh = useCallback(async () => {
    await fetchMe();
  }, [fetchMe]);

  const value = useMemo<Auth>(
    () => ({ status, user, login, register, logout, refresh, fetcher }),
    [status, user, login, register, logout, refresh, fetcher]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
