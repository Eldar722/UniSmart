import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { UserProfile } from "@/data/mockData";

interface UserContextType {
  isAuthenticated: boolean;
  user: { email: string; name: string } | null;
  profile: UserProfile | null;
  comparisonList: string[];
  favorites: string[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
  addToFavorites: (uniId: string) => void;
  removeFromFavorites: (uniId: string) => void;
  toggleFavorite: (uniId: string) => void;
  addToComparison: (programId: string) => void;
  removeFromComparison: (programId: string) => void;
  clearComparison: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

export function UserProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [comparisonList, setComparisonList] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const saveToken = (token: string | null) => {
    if (token) localStorage.setItem("auth_token", token);
    else localStorage.removeItem("auth_token");
  };

  // persist comparison and favorites
  const saveComparison = (list: string[] | null) => {
    if (list) localStorage.setItem("comparison_list", JSON.stringify(list));
    else localStorage.removeItem("comparison_list");
  };

  const saveFavorites = (list: string[] | null) => {
    if (list) localStorage.setItem("favorites", JSON.stringify(list));
    else localStorage.removeItem("favorites");
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        saveToken(data.token);
        setIsAuthenticated(true);
        if (data.user) setUser({ email: data.user.email, name: data.user.name });
        // restore lists from localStorage if any
        const storedComparison = localStorage.getItem("comparison_list");
        if (storedComparison) setComparisonList(JSON.parse(storedComparison));
        const storedFavorites = localStorage.getItem("favorites");
        if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login error", err);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        saveToken(data.token);
        setIsAuthenticated(true);
        if (data.user) setUser({ email: data.user.email, name: data.user.name });
        const storedComparison = localStorage.getItem("comparison_list");
        if (storedComparison) setComparisonList(JSON.parse(storedComparison));
        const storedFavorites = localStorage.getItem("favorites");
        if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Register error", err);
      return false;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.warn("Logout error", err);
    } finally {
      saveToken(null);
      setIsAuthenticated(false);
      setUser(null);
      setProfileState(null);
      setComparisonList([]);
      setFavorites([]);
      saveComparison([]);
      saveFavorites([]);
    }
  };

  const setProfile = (newProfile: UserProfile) => setProfileState(newProfile);
  const clearProfile = () => setProfileState(null);

  const addToComparison = (programId: string) => {
    if (comparisonList.length < 3 && !comparisonList.includes(programId)) {
      const next = [...comparisonList, programId];
      setComparisonList(next);
      saveComparison(next);
    }
  };
  const removeFromComparison = (programId: string) => {
    const next = comparisonList.filter((id) => id !== programId);
    setComparisonList(next);
    saveComparison(next);
  };
  const clearComparison = () => {
    setComparisonList([]);
    saveComparison([]);
  };

  // Favorites
  const addToFavorites = (uniId: string) => {
    if (!favorites.includes(uniId)) {
      const next = [...favorites, uniId];
      setFavorites(next);
      saveFavorites(next);
    }
  };

  const removeFromFavorites = (uniId: string) => {
    const next = favorites.filter((id) => id !== uniId);
    setFavorites(next);
    saveFavorites(next);
  };

  const toggleFavorite = (uniId: string) => {
    if (favorites.includes(uniId)) removeFromFavorites(uniId);
    else addToFavorites(uniId);
  };

  useEffect(() => {
    // restore comparison and favorites from localStorage for guest users too
    const storedComparison = localStorage.getItem("comparison_list");
    if (storedComparison) setComparisonList(JSON.parse(storedComparison));
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) setFavorites(JSON.parse(storedFavorites));

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          saveToken(null);
          return;
        }
        const data = await res.json();
        if (data && data.success && data.user) {
          setIsAuthenticated(true);
          setUser({ email: data.user.email, name: data.user.name });
        } else {
          saveToken(null);
        }
      } catch (err) {
        console.error("Session restore error", err);
        saveToken(null);
      }
    })();
  }, []);

  return (
    <UserContext.Provider
      value={{
        isAuthenticated,
        user,
        profile,
        comparisonList,
        login,
        register,
        logout,
        setProfile,
        clearProfile,
        favorites,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        addToComparison,
        removeFromComparison,
        clearComparison,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}