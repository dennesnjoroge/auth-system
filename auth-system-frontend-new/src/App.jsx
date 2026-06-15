import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DashboardLayout from "./pages/DashboardLayout";
import Overview from "./components/dashboard/Overview";
import Profile from "./components/dashboard/Profile";
import Security from "./components/dashboard/Security";
import Sessions from "./components/dashboard/Sessions";

function App() {
  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/verify" element={<VerifyEmail />}></Route>
          <Route path="/forgot" element={<ForgotPassword />}></Route>
          <Route path="/forgot/flow" element={<ResetPassword />}></Route>

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="profile" element={<Profile />} />
            <Route path="security" element={<Security />} />
            <Route path="sessions" element={<Sessions />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
