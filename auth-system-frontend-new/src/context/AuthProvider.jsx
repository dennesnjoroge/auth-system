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
        //setLoading(false);
      }
    }
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        const response = await api.get("/api/v1/users/profile");
        setProfile(response.data.payload);
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            setProfile(null);
          }
        } else if (error.request) {
          console.error(
            "Network error. Please check your internet connection.",
          );
        } else {
          console.error("An unexpected error occurred.");
        }
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [session]);

  useEffect(() => {
    if (!session) {
      setSettings(null);
      setLoading(false);
      return;
    }

    async function fetchPasswordChangeHistory() {
      try {
        const response = await api.get("/api/v1/users/settings");
        setSettings(response.data.payload);
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            setSettings(null);
          }
        } else if (error.request) {
          console.error(
            "Network error. Please check your internet connection.",
          );
        } else {
          console.error("An unexpected error occurred.");
        }
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPasswordChangeHistory();
  }, [session]);

  /*
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response, // Pass successful responses straight through
      async (error) => {
        const originalRequest = error.config;

        // Catch the custom 'expired' status code we built on our backend
        if (
          error.response?.data?.status === "expired" &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true; // Prevents infinite loops if refresh fails

          try {
            // Call the refresh endpoint. Axios automatically passes the _rt cookie
            await api.post("/api/v1/auth/refresh");

            // Retry the original request that failed earlier
            return api(originalRequest);
          } catch (refreshError) {
            // If the refresh token is also dead, log out the user completely
            setUser(null);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );

    // Clean up the interceptor hook if the component unmounts
    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);
  */

  const login = (userData) => {
    setSession(userData);
  };

  const logout = async () => {
    setSession(null);
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

{
  /**<AuthContext.Provider 
      value={{ 
        user, 
        session, 
        loading, 
        isAuthenticated: !!session && !!user, // Quick boolean check
        logout,
        refreshAuth: initializeAuth 
      }}
    >
      {children}
    </AuthContext.Provider> */
}
