import React, { useState, useEffect } from "react";
import apiClient from "../../config/axios";
import { useNavigate, Link } from "react-router-dom";
import firebaseAuthService from "../../services/firebaseAuth";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Validation schema
const loginSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required")
});

const Login = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(loginSchema)
  });

  useEffect(() => {
    // If user is already authenticated, redirect to appropriate page
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token) {
      try {
        const user = userStr ? JSON.parse(userStr) : null;
        if (user && user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/home');
        }
      } catch (err) {
        // fallback to home
        navigate('/home');
      }
    }
  }, [navigate]);

  const handleLogin = async (data) => {
    setMessage(""); // Clear previous message
    setLoading(true);
    
    try {
      // Use Firebase email/password authentication
      const result = await firebaseAuthService.signInWithEmail(data.email, data.password);
      setMessage("Login successful!");

      // Redirect based on role
      if (result.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }

    } catch (error) {
      // Display error message from Firebase or backend
      setMessage(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage("");
    try {
      const result = await firebaseAuthService.signInWithGoogle();
      setMessage("Google login successful!");
      
      // Redirect based on role
      if (result.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setMessage(error.message || "Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setMessage("");
    try {
      const result = await firebaseAuthService.signInWithFacebook();
      setMessage("Facebook login successful!");
      
      // Redirect based on role
      if (result.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Facebook login error:", error);
      setMessage(error.message || "Facebook login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLoginNewAccount = async () => {
    setLoading(true);
    setMessage("");
    try {
      const result = await firebaseAuthService.signInWithFacebookNewAccount();
      setMessage("Facebook login with new account successful!");
      
      // Redirect based on role
      if (result.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Facebook new account login error:", error);
      setMessage(error.message || "Facebook login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      
      {/* Social Login Buttons */}
      <div className="social-login-buttons">
        <button
          type="button"
          className="social-btn google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <FaGoogle className="social-icon" />
          Continue with Google
        </button>
        
        <button
          type="button"
          className="social-btn facebook-btn"
          onClick={handleFacebookLogin}
          disabled={loading}
        >
          <FaFacebook className="social-icon" />
          Continue with Facebook
        </button>
      </div>
      
      <div className="separator">
        <span>or</span>
      </div>
      
      {/* Regular Login Form */}
      <form onSubmit={handleSubmit(handleLogin)}>
        <div>
          <input
            type="email"
            placeholder="Email"
            {...register("email")}
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && (
            <span className="error-message">{errors.email.message}</span>
          )}
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            {...register("password")}
            className={errors.password ? "input-error" : ""}
          />
          {errors.password && (
            <span className="error-message">{errors.password.message}</span>
          )}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login with Firebase"}
        </button>
      </form>
      
      {message && <p style={{ color: message.includes("successful") ? "green" : "red", marginTop: "10px" }}>{message}</p>}
      
      <div className="login-links">
        <Link to="/forgot-password">Forgot Password?</Link>
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
