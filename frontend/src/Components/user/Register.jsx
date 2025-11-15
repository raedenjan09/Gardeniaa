import React, { useState } from "react";
import apiClient from "../../config/axios";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../layouts/Loader";

const SuccessOverlay = ({ message, redirectText }) => {
  return (
    <div className="success-overlay">
      <div className="success-content">
        <div className="success-icon">✓</div>
        <h3>{message}</h3>
        <p>{redirectText}</p>
      </div>
    </div>
  );
};

const Register = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    city: "",
    barangay: "",
    street: "",
    zipcode: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      const userData = {
        name: user.name,
        email: user.email,
        password: user.password,
        contact: user.contact,
        address: {
          city: user.city,
          barangay: user.barangay,
          street: user.street,
          zipcode: user.zipcode
        }
      };

      const { data } = await apiClient.post("/register", userData);
      
      setMessage("Registration successful! Verification email sent. Please check your email to verify your account before logging in.");
      setShowSuccess(true);
      
      // Redirect to login after 5 seconds to give time to read the message
      setTimeout(() => {
        navigate('/login');
      }, 5000);
      
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" onChange={handleChange} required disabled={loading} />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required disabled={loading} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required disabled={loading} />
       
        <h3 style={{marginTop: '20px', marginBottom: '10px'}}>Personal Information </h3>
        <input type="text" name="contact" placeholder="Phone Number (optional)" onChange={handleChange} disabled={loading} />
        <input type="text" name="city" placeholder="City" onChange={handleChange} disabled={loading} />
        <input type="text" name="barangay" placeholder="Barangay" onChange={handleChange} disabled={loading} />
        <input type="text" name="street" placeholder="Street" onChange={handleChange} disabled={loading} />
        <input type="text" name="zipcode" placeholder="Zipcode" onChange={handleChange} disabled={loading} />
        
        <button type="submit" disabled={loading}>
          Register
        </button>
        
        {loading && <Loader />}
      </form>
      
      {!showSuccess && message && !message.includes('successful') && (
        <div className="error-message">
          {message}
        </div>
      )}
      
      {showSuccess && (
        <SuccessOverlay
          message={message}
          redirectText="Redirecting to login page..."
        />
      )}
      
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};

export default Register;