import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";

function ForgotPassword() {
  const [emailAddress, setEmailAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const validRef = location.state?.fromLogin;

  useEffect(() => {
    if (!validRef) {
      navigate("/login", { replace: true });
    }
  }, [validRef, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});

    setLoading(true);

    try {
      const response = await api.post("/api/v1/auth/forgot-password", {
        emailAddress,
      });
      toast.success(
        response?.data?.message || "A reset link has been sent to your email",
      );
      navigate("/login", { replace: true });
    } catch (error) {
      if (error.response) {
        if (error.response?.data?.errors) {
          setErrors(
            error?.response?.data?.errors || "Something went wrong try again",
          );
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md rounded-xl shadow-md p-6 space-y-5"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>

          <p className="text-sm text-gray-500 mt-1">
            Enter your email address to continue
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

        <button
          type="submit"
          className="w-full bg-black text-white px-3 py-2 rounded-lg font-medium hover:opacity-90 transition cursor-pointer"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
