import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import api from "../../api/axios";
function Security() {
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { settings } = useAuth();
  const changedAt = settings?.changed_at;
  const navigate = useNavigate();

  async function handlePasswordChange(e) {
    e.preventDefault();

    if (password !== repeatPassword) {
      toast.error("Passwords do not match");
      setPassword("");
      setRepeatPassword("");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/v1/auth/change-password", {
        password,
      });

      toast.success(response?.data.message || "Password updated successfully");
      setPassword("");
      setRepeatPassword("");

      window.location.reload();
    } catch (error) {
      if (error.response) {
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
  }

  async function handleDelete() {
    const userInput = window.prompt(
      "Type 'DELETE' to confirm you want to close your account.",
    );

    if (userInput === "DELETE") {
      try {
        await api.post("/api/v1/users/delete");
        toast.success("Account deleted successfully.");

        navigate("/login", { replace: true });
      } catch (error) {
        if (error.response) {
          toast.error(
            error?.response?.data?.message ||
              "Something went wrong please try again.",
          );
        } else if (error.request) {
          toast.error("Network error. Please check your internet connection.");
        } else {
          toast.error("An unexpected error occurred.");
        }
      }
    } else if (userInput !== null) {
      toast.error("Incorrect word. Account was not deleted.");
    }
  }

  return (
    <div className="relative w-full p-6 bg-white border-gray-100">
      <h2 className="text-3xl px-6 font-bold mb-6 text-black">Settings</h2>

      <div className="border px-6 py-6 border-gray-200 rounded-lg">
        <div className="text-lg text-black">
          <div className="flex items-center justify-between mb-4">
            <p>Password</p>
            <span>***********</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p>2 FA(2 Factor Authentication)</p>
            <span>
              <input type="checkbox" name="" id="" />
            </span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p>Last password change</p>
            <span>
              {changedAt
                ? new Date(settings.changed_at).toLocaleString()
                : "No entries found"}
            </span>
          </div>

          <button
            onClick={() => setIsPasswordOpen(true)}
            className="bg-black text-white px-3 py-2 rounded-sm cursor-pointer"
          >
            Change Password
          </button>
        </div>
      </div>

      {isPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between px-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Change Password
              </h2>
              <button
                onClick={() => setIsPasswordOpen(false)}
                className="font-bold cursor-pointer"
              >
                X
              </button>
            </div>

            <form
              onSubmit={handlePasswordChange}
              className="bg-white w-full max-w-md rounded-xl p-6 space-y-5"
            >
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-black"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Repeat Password
                </label>

                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-black"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white px-3 py-2 rounded-lg font-medium hover:opacity-90 transition cursor-pointer disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Changing..." : "Change password"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="border px-6 py-6 mt-6 border-red-200 rounded-lg">
        <div className="text-lg text-black">
          <h2 className="text-red-600 font-bold">Danger Zone</h2>

          <button
            onClick={handleDelete}
            className="bg-red-600 mt-6 text-white px-3 py-2 rounded-sm cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Security;
