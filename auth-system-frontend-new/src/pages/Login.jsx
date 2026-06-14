import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

function Login() {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await api.post("/api/v1/auth/login", {
        emailAddress,
        password,
      });
      toast.success(response?.data?.message || "Login was successful");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error.response) {
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
          return;
        }

        toast.error(
          error?.response?.data?.message ||
            "Something went wrong please try again.",
        );
      } else if (error.request) {
        toast.error("Network error. Please check your internet connection.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md rounded-xl shadow-md p-6 space-y-5"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Login</h2>

          <p className="text-sm text-gray-500 mt-1">
            Enter your details to continue
          </p>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>

          <input
            type="email"
            placeholder="example@mail.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-black"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            required
          />

          {errors.emailAddress && (
            <span className="text-red-500">{errors.emailAddress}</span>
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>

          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
          />

          {errors.password && (
            <span className="text-red-500">{errors.password}</span>
          )}

          <Link className="underline" to="/forgot" state={{ fromLogin: true }}>
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white px-3 py-2 rounded-lg font-medium hover:opacity-90 transition cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
        <p>
          Don't have an account?{" "}
          <Link className="underline font-medium" to="/register">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
