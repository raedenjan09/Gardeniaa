import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../../config/axios";
import Loader from "../layouts/Loader";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setStatus("verifying");
        const { data } = await apiClient.get(`/verify-email/${token}`);
        
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Email verification failed. The link may be invalid or expired.");
        console.error("Email verification error:", error);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus("error");
      setMessage("Invalid verification link.");
    }
  }, [token, navigate]);

  return (
    <div className="form-container" style={{ textAlign: 'center', padding: '40px' }}>
      <h2>Email Verification</h2>
      
      {status === "verifying" && (
        <div>
          <Loader />
          <p>Verifying your email address...</p>
        </div>
      )}
      
      {status === "success" && (
        <div style={{ color: 'green' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
          <h3>Email Verified Successfully!</h3>
          <p>{message}</p>
          <p>Redirecting to login page...</p>
          <Link to="/login" style={{ display: 'block', marginTop: '20px' }}>
            Click here if you are not redirected automatically
          </Link>
        </div>
      )}
      
      {status === "error" && (
        <div style={{ color: 'red' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✗</div>
          <h3>Verification Failed</h3>
          <p>{message}</p>
          <div style={{ marginTop: '20px' }}>
            <Link to="/register" style={{ marginRight: '15px' }}>
              Register Again
            </Link>
            <Link to="/login">
              Go to Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;