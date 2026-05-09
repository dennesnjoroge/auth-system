import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        "/api/auth/logout",
        {},
        { withCredentials: true },
      );

      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
      return error;
    }
    //console.log("Logout clicked");
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account?",
    );

    if (confirmed) {
      try {
        const res = await axios.post(
          "/api/delete-account",
          {},
          { withCredentials: true },
        );
        toast.success(res.data.message);
        navigate("/");
      } catch (error) {
        toast.error(error.response?.data?.message);
      }
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get("/api/dashboard", {
          withCredentials: true,
        });

        setUser(res.data.data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load dashboard",
        );
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="mt-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="container mb-4">
        <div>
          <h1>Dashboard</h1>
          <p>
            Welcome, <br /> {`${user.first_name} ${user.last_name}`}
          </p>
        </div>

        <button className="btn btn-dark fw-bold" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="d-flex flex-column align-items-center justify-content-center ">
        <div className="card mb-4">
          <h2>Profile</h2>
          <div className="profile-info">
            <div className="row mb-2">
              <div className="col-4 text-muted">Full name</div>
              <div className="col-8 fw-semibold">
                {`${user.first_name} ${user.last_name}`}
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-4 text-muted">Email</div>
              <div className="col-8">
                <div className="fw-semibold">{user.email_address}</div>
                <small className="text-muted">
                  {user.email_address_verified ? "Verified" : "Unverified"}
                </small>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-4 text-muted">Phone</div>
              <div className="col-8">
                <div className="fw-semibold">
                  {user.phone_number || "No phone added"}
                </div>
                <small className="text-muted">
                  {user.phone_number_verified ? "Verified" : "Unverified"}
                </small>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-4 text-muted">Role</div>
              <div className="col-8 fw-semibold">
                {user.user_role
                  ? user.user_role[0].toUpperCase() + user.user_role.slice(1)
                  : "User"}
              </div>
            </div>

            <div className="row">
              <div className="col-4 text-muted">Joined</div>
              <div className="col-8 fw-semibold">
                {user.created_at
                  ? new Date(user.created_at).toLocaleString("en-GB", {
                      month: "short",
                      year: "numeric",
                    })
                  : "-"}
              </div>
            </div>
          </div>

          <div className="card-actions">
            <Link className="btn btn-dark" to="/edit-profile">
              Edit Profile
            </Link>

            <Link className="btn btn-outline" to="/change-password">
              Change Password
            </Link>
          </div>
        </div>

        <div className="card mb-4">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="btn btn-dark">View Activity</button>
            <button className="btn btn-dark">Notifications</button>
            <button className="btn btn-dark">Security Settings</button>
            <button className="btn btn-dark">Billing</button>
          </div>
        </div>

        <div className="card danger-card mb-4">
          <h2>Danger Zone</h2>
          <p>
            Deleting your account is permanent. Your profile and related data
            may be removed permanently.
          </p>

          <button className="btn btn-danger" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
