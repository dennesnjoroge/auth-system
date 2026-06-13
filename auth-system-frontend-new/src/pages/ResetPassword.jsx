import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [params] = useSearchParams();
  const navigate = useNavigate();
  const resetToken = params.get("token");

  useEffect(() => {
    if (!resetToken) {
      navigate("/login");
      return;
    }
  }, [resetToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});

    if (password.length < 8) {
      setErrors({ password: "Password must be at least 6 characters long." });
      return;
    }

    if (password !== repeatPassword) {
      setErrors({ repeatPassword: "Passwords do not match." });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/api/v1/auth/reset-password", {
        resetToken,
        password,
      });
      toast.success(response?.data?.message || "Password reset successful");
      navigate("/login");
    } catch (error) {
      if (error.response) {
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
          return;
        }

        toast.error(
          error.response?.data?.message ||
            "Something went wrong. Please try again.",
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
          <h2 className="text-2xl font-bold text-gray-900">Reset password</h2>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password *
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
        </div>

        <div className="space-y-2">
          <label
            htmlFor="repeatPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Repeat Password *
          </label>

          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-black"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            placeholder="********"
            required
          />
        </div>
        {errors.repeatPassword && (
          <span className="text-red-500">{errors.repeatPassword}</span>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white px-3 py-2 mt-2 rounded-lg font-medium hover:opacity-90 transition cursor-pointer"
        >
          {isLoading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
