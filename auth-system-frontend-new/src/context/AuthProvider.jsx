import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import api from "../api/axios";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const response = await api.get("/api/v1/auth/session");
        setSession(response.data.payload);
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            setSession(null);
          }
        } else if (error.request) {
          console.error(
            "Network error. Please check your internet connection.",
          );
        } else {
          console.error("An unexpected error occurred.");
        }
        setSession(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    let isMounted = true;

    async function fetchUserData() {
      try {
        const [profileRes, settingsRes] = await Promise.all([
          api.get("/api/v1/users/profile"),
          api.get("/api/v1/users/settings"),
        ]);

        if (isMounted) {
          setProfile(profileRes.data.payload);
          setSettings(settingsRes.data.payload);
        }
      } catch (error) {
        if (isMounted) {
          if (error.response?.status === 401) {
            setSession(null);
          } else {
            if (error.response) {
              console.error(
                "Failed to fetch user data:",
                error.response.status,
              );
            } else if (error.request) {
              console.error(
                "Network error. Please check your internet connection.",
              );
            } else {
              console.error("An unexpected error occurred.");
            }
            setProfile(null);
            setSettings(null);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [session]);

  const login = (userData) => {
    setSession(userData);
  };

  const logout = async () => {
    setSession(null);
    setProfile(null);
    setSettings(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        settings,
        login,
        logout,
        loading,
        isAuthenticated: !!session,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
