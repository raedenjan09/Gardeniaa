import React, { useState } from "react";
import apiClient from "../../config/axios";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../layouts/Loader";
import firebaseAuthService from "../../services/firebaseAuth";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

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

// Validation schema
const registerSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  contact: yup
    .string()
    .matches(/^[0-9+\-\s()]+$/, "Please enter a valid phone number")
    .optional(),
  city: yup.string().optional(),
  barangay: yup.string().optional(),
  street: yup.string().optional(),
  zipcode: yup
    .string()
    .matches(/^\d{4}$/, "Zipcode must be 4 digits")
    .optional()
});

const Register = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(registerSchema)
  });

  const handleRegister = async (data) => {
    setLoading(true);
    setMessage("");
    
    try {
      // Use Firebase email/password registration
      const userData = {
        name: data.name,
        contact: data.contact || "",
        address: {
          city: data.city || "",
          barangay: data.barangay || "",
          street: data.street || "",
          zipcode: data.zipcode || ""
        }
      };

      const result = await firebaseAuthService.signUpWithEmail(
        data.email,
        data.password,
        userData
      );
      
      setMessage("Registration successful! You can now log in.");
      setShowSuccess(true);
      
      // Redirect to login after 3 seconds to give time to read the message
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      setMessage(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit(handleRegister)}>
        <div>
          <input
            type="text"
            placeholder="Name"
            {...register("name")}
            className={errors.name ? "input-error" : ""}
            disabled={loading}
          />
          {errors.name && <span className="error-message">{errors.name.message}</span>}
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            {...register("email")}
            className={errors.email ? "input-error" : ""}
            disabled={loading}
          />
          {errors.email && <span className="error-message">{errors.email.message}</span>}
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            {...register("password")}
            className={errors.password ? "input-error" : ""}
            disabled={loading}
          />
          {errors.password && <span className="error-message">{errors.password.message}</span>}
        </div>
       
        <h3 style={{marginTop: '20px', marginBottom: '10px'}}>Personal Information (Optional)</h3>
        <div>
          <input
            type="text"
            placeholder="Phone Number (optional)"
            {...register("contact")}
            className={errors.contact ? "input-error" : ""}
            disabled={loading}
          />
          {errors.contact && <span className="error-message">{errors.contact.message}</span>}
        </div>
        <div>
          <input
            type="text"
            placeholder="City"
            {...register("city")}
            className={errors.city ? "input-error" : ""}
            disabled={loading}
          />
          {errors.city && <span className="error-message">{errors.city.message}</span>}
        </div>
        <div>
          <input
            type="text"
            placeholder="Barangay"
            {...register("barangay")}
            className={errors.barangay ? "input-error" : ""}
            disabled={loading}
          />
          {errors.barangay && <span className="error-message">{errors.barangay.message}</span>}
        </div>
        <div>
          <input
            type="text"
            placeholder="Street"
            {...register("street")}
            className={errors.street ? "input-error" : ""}
            disabled={loading}
          />
          {errors.street && <span className="error-message">{errors.street.message}</span>}
        </div>
        <div>
          <input
            type="text"
            placeholder="Zipcode"
            {...register("zipcode")}
            className={errors.zipcode ? "input-error" : ""}
            disabled={loading}
          />
          {errors.zipcode && <span className="error-message">{errors.zipcode.message}</span>}
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
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