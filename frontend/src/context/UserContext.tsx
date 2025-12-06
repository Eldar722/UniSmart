import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { UserProfile } from "@/data/mockData";

  interface UserContextType {
    isAuthenticated: boolean;
    user: { id?: string; email: string; name: string } | null;
    token: string | null;
    profile: UserProfile | null;
    comparisonList: string[];
    favorites: string[];
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    setProfile: (profile: UserProfile) => void;
    clearProfile: () => void;
    saveProfileToServer: (profile: UserProfile) => Promise<void>;
    loadProfileFromServer: () => Promise<void>;
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
  const [user, setUser] = useState<{ id?: string; email: string; name: string } | null>(null);
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
      if (data.user) setUser({ id: data.user.id, email: data.user.email, name: data.user.name });
        
        // Load lists from server
        await loadFavoritesFromServer();
        await loadComparisonFromServer();
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
      if (data.user) setUser({ id: data.user.id, email: data.user.email, name: data.user.name });
        
        // Load lists from server
        await loadFavoritesFromServer();
        await loadComparisonFromServer();
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

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    if (isAuthenticated) {
      saveProfileToServer(newProfile);
    }
  };
  const clearProfile = () => setProfileState(null);

  const addToComparison = (programId: string) => {
    if (comparisonList.length < 3 && !comparisonList.includes(programId)) {
      const next = [...comparisonList, programId];
      setComparisonList(next);
      saveComparison(next);
      syncComparisonToServer(next);
    }
  };
  const removeFromComparison = (programId: string) => {
    const next = comparisonList.filter((id) => id !== programId);
    setComparisonList(next);
    saveComparison(next);
    syncComparisonToServer(next);
  };
  const clearComparison = () => {
    setComparisonList([]);
    saveComparison([]);
    syncComparisonToServer([]);
  };

  // Favorites
  const addToFavorites = (uniId: string) => {
    if (!favorites.includes(uniId)) {
      const next = [...favorites, uniId];
      setFavorites(next);
      saveFavorites(next);
      syncFavoritesToServer(next);
    }
  };

  const removeFromFavorites = (uniId: string) => {
    const next = favorites.filter((id) => id !== uniId);
    setFavorites(next);
    saveFavorites(next);
    syncFavoritesToServer(next);
  };

  const toggleFavorite = (uniId: string) => {
    if (favorites.includes(uniId)) removeFromFavorites(uniId);
    else addToFavorites(uniId);
  };

  // Sync methods: save to server
  const syncFavoritesToServer = async (list: string[]) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    try {
      await fetch(`${API_BASE}/user/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ favorites: list }),
      });
    } catch (err) {
      console.warn("Failed to sync favorites to server", err);
    }
  };

  const syncComparisonToServer = async (list: string[]) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    try {
      await fetch(`${API_BASE}/user/comparison`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comparison_list: list }),
      });
    } catch (err) {
      console.warn("Failed to sync comparison to server", err);
    }
  };

  // Load from server
  const loadFavoritesFromServer = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/user/favorites`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.favorites) {
          setFavorites(data.favorites);
          saveFavorites(data.favorites);
        }
      }
    } catch (err) {
      console.warn("Failed to load favorites from server", err);
    }
  };

  const loadComparisonFromServer = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/user/comparison`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.comparison_list) {
          setComparisonList(data.comparison_list);
          saveComparison(data.comparison_list);
        }
      }
    } catch (err) {
      console.warn("Failed to load comparison from server", err);
    }
  };

  const saveProfileToServer = async (profileData: UserProfile) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    try {
      await fetch(`${API_BASE}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          entScore: profileData.entScore,
          ieltsScore: profileData.ieltsScore,
          profileSubjects: profileData.profileSubjects,
          interests: profileData.interests,
          budget: profileData.budget,
          preferredCity: profileData.preferredCity,
        }),
      });
    } catch (err) {
      console.warn("Failed to save profile to server", err);
    }
  };

  const loadProfileFromServer = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          const serverProfile = data.profile;
          // Merge with default values
          const mergedProfile: UserProfile = {
            entScore: serverProfile.entScore || 0,
            ieltsScore: serverProfile.ieltsScore || 0,
            profileSubjects: serverProfile.profileSubjects || [],
            interests: serverProfile.interests || [],
            budget: serverProfile.budget || 0,
            preferredCity: serverProfile.preferredCity || "Любой",
          };
          setProfileState(mergedProfile);
        }
      }
    } catch (err) {
      console.warn("Failed to load profile from server", err);
    }
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
          setUser({ id: data.user.id, email: data.user.email, name: data.user.name });
          
          // Load server data
          await loadFavoritesFromServer();
          await loadComparisonFromServer();
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
        token: localStorage.getItem("auth_token"),
        profile,
        comparisonList,
        login,
        register,
        logout,
        setProfile,
        clearProfile,
        saveProfileToServer,
        loadProfileFromServer,
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