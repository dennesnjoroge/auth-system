import { AuthProvider } from "./context/AuthProvider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DashboardLayout from "./pages/DashboardLayout";
import Overview from "./components/dashboard/Overview";
import Profile from "./components/dashboard/Profile";
import Security from "./components/dashboard/Security";
import Settings from "./components/dashboard/Settings";

function App() {
  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot/flow" element={<ResetPassword />} />
            <Route path="/verify" element={<VerifyEmail />} />

            {/**Protected */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="profile" element={<Profile />} />
              <Route path="security" element={<Security />} />
              <Route path="sessions" element={<Settings />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
