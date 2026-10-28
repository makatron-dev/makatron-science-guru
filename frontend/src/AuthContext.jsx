import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { api, getToken, setToken, clearToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const secondsRef = useRef(0);
  const intervalRef = useRef(null);

  // 1. Load user on mount
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      if (!getToken()) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const u = await api.me();
        if (isMounted) setUser(u);
      } catch (err) {
        // Only treat auth failures as a logout. Network errors / server 5xx
        // should NOT log the user out — they might just be offline for a moment.
        const status = err?.status;
        if (status === 401 || status === 403) {
          clearToken();
          if (isMounted) setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUser();
    return () => { isMounted = false; };
  }, []);

  // 2. Global session timer (single source of truth for study time).
  useEffect(() => {
    if (user && !user.is_admin) {
      intervalRef.current = setInterval(() => {
        setSessionSeconds((s) => {
          secondsRef.current = s + 1;
          return s + 1;
        });
      }, 1000);

      const handleUnload = () => {
        if (secondsRef.current > 0) {
          api.saveStudyTime(secondsRef.current).catch(() => {});
        }
      };

      window.addEventListener("beforeunload", handleUnload);

      return () => {
        clearInterval(intervalRef.current);
        window.removeEventListener("beforeunload", handleUnload);
        if (secondsRef.current > 0) {
          api.saveStudyTime(secondsRef.current).catch(() => {});
        }
      };
    } else {
      clearInterval(intervalRef.current);
      setSessionSeconds(0);
      secondsRef.current = 0;
    }
  }, [user]);

  const login = useCallback(async (username, password) => {
    const res = await api.login({ username, password });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await api.register(payload);
    setToken(res.token);
    setUser(res.user);
    return res;
  }, []);

  const updateProfile = useCallback(async (patch) => {
    const u = await api.updateMe(patch);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await api.me();
      setUser(u);
      return u;
    } catch (err) {
      console.error("Failed to refresh user", err);
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout, refreshUser, sessionSeconds }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}