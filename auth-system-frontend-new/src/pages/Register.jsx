import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});

    try {
      if (password !== repeatPassword) {
        setErrors({ password: "Passwords do not match" });
        return;
      }

      const { data } = await api.post("/api/v1/auth/register", {
        firstName,
        lastName,
        emailAddress,
        password,
      });
      toast.success(data.message);
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md rounded-xl shadow-md p-6 space-y-2"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Register</h2>

          <p className="text-sm text-gray-500 mt-1">
            All field marked * are required
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name*
          </label>

          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-black"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            required
          />

          {errors.firstName && (
            <span className="text-red-500">{errors.firstName}</span>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name*
          </label>

          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-black"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            required
          />

          {errors.lastName && (
            <span className="text-red-500">{errors.lastName}</span>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="emailAddress"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address*
          </label>

          <input
            type="email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-black"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            placeholder="example@mail.com"
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

        <button
          type="submit"
          className="bg-black text-white font-medium w-full mt-2 px-3 py-2 rounded-lg cursor-pointer hover:opacity-90 transition"
        >
          Register
        </button>
        <p>
          Already have an account?{" "}
          <Link to="/login" className="font-medium underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
