import React, { useState, useEffect } from "react";
import apiClient from "../../config/axios";
import { useNavigate, Link } from "react-router-dom";
import firebaseAuthService from "../../services/firebaseAuth";
import { FaGoogle, FaFacebook } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous message
    try {
      const { data } = await apiClient.post("/login", { email, password });

      // Store user data in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          id: data.user._id
        })
      );

      setMessage("Login successful!");

      // Redirect based on role
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        // Normal users go to the site home
        navigate("/home");
      }

    } catch (error) {
      const errorMsg = error.response?.data?.message || "Invalid credentials";

      // Check for inactive user message
      if (errorMsg.includes("inactive")) {
        setMessage("Your account is inactive. Please contact support.");
      } else if (errorMsg.includes("verify")) {
        setMessage("Please verify your email before logging in.");
      } else {
        setMessage(errorMsg);
      }
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
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
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
