import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";

function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const verificationToken = params.get("token");

  const isVerifying = useRef(false);

  useEffect(() => {
    if (!verificationToken) {
      navigate("/login", { replace: true });
      return;
    }

    if (isVerifying.current) return;
    isVerifying.current = true;

    const verifyEmail = async () => {
      try {
        const response = await api.post("/api/v1/auth/verify-email", {
          verificationToken,
        });
        console.log(response.data);
        toast.success(response?.data?.message || "Verification Successful");
        navigate("/dashboard", { replace: true });
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
        navigate("/login", { replace: true });
      }
    };

    verifyEmail();
  }, [verificationToken, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <p>Verifying your email, please wait...</p>
    </div>
  );
}

export default VerifyEmail;
