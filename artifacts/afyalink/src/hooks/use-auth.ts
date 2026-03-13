import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const AUTH_KEY = "afyalink_chp_id";

export function useAuth() {
  const [chpId, setChpId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      setChpId(stored);
    }
    setIsLoaded(true);
  }, []);

  const login = (id: string) => {
    localStorage.setItem(AUTH_KEY, id);
    setChpId(id);
    setLocation("/queue");
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setChpId(null);
    setLocation("/login");
  };

  return { chpId, login, logout, isLoaded, isAuthenticated: !!chpId };
}
