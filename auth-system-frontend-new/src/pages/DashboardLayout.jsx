import { Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Aside from "../components/dashboard/Aside";
function DashboardLayout() {
  const { user } = useAuth();

  const handleLogout = () => {
    try {
      console.log(user);
      console.log("Logout");
      //navigate("/login", { replace: true });
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
