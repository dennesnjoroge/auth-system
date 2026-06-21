import { Outlet } from "react-router-dom";
import Aside from "../components/dashboard/Aside";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";
import { toast } from "react-toastify";

function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await api.post("/api/v1/auth/logout");
      toast.success(response?.data?.message || "Logout was successful");
      logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="flex justify-between px-8 py-2 items-center bg-black text-white">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <button
          onClick={handleLogout}
          className="font-semibold rounded-sm px-3 py-2 cursor-pointer"
        >
          Logout
        </button>
      </header>

      <main className="flex flex-1">
        <Aside />

        <div className="flex flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
