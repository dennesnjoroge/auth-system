import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const ProtectedRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading secure session...</div>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
