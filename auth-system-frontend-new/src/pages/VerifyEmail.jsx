import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";
function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const verificationToken = searchParams.get("token");

  useEffect(() => {
    if (!verificationToken) {
      navigate("/login");
    }
  }, [verificationToken, navigate]);

  const verifyEmail = async () => {
    try {
      const response = await api.post("/api/v1/auth/verify-email", {
        verificationToken,
      });
      toast.success(response?.data?.message || "Verification Successful");
      navigate("/login");
    } catch (error) {
      navigate("/login");
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
  };

  verifyEmail();
}

export default VerifyEmail;
