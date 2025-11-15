import React, { useState } from "react";
import apiClient from "../../config/axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

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

  return (
    <div className="form-container">
      <h2>Login</h2>
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
        <button type="submit">Login</button>
      </form>
      {message && <p style={{ color: "red", marginTop: "10px" }}>{message}</p>}
      <Link to="/forgot-password">Forgot Password?</Link>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
