import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
function Login() {
  let [emailAddress, setEmailAddress] = useState("");
  let [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const res = await axios.post(
        "/api/auth/login",
        {
          emailAddress,
          password,
        },
        {
          withCredentials: true,
        },
      );

      toast.success(res.data?.message);
      navigate("/dashboard");
    } catch (error) {
      if (error.response) {
        toast.error(error.response?.data?.message);
      } else if (error.request) {
        toast.error(
          "Network error. Please check your connection and try again.",
        );
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <div className="card">
        <h2>Sign in</h2>
        <p>Enter your details to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="row">
            <label>
              <input type="checkbox" /> Remember
            </label>
            <Link to="/forgot">Forgot password?</Link>
          </div>

          <button
            className="btn btn-dark fw-bold"
            type="submit"
            disabled={isLoading || !emailAddress || !password}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <div className="footer">
            No account? <Link to="/register">Signup</Link>
          </div>
        </form>
      </div>
    </>
  );
}

export default Login;
