import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";

// Validation schema for profile update
const profileSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  contact: yup
    .string()
    .required("Contact number is required")
    .matches(/^(\+63|0)[0-9]{10}$/, "Please enter a valid Philippine phone number (09XXXXXXXXX)")
    .min(11, "Phone number must be 11 digits")
    .max(13, "Phone number must be 13 digits"),
  city: yup
    .string()
    .required("City is required")
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be less than 50 characters"),
  barangay: yup
    .string()
    .required("Barangay is required")
    .min(2, "Barangay must be at least 2 characters")
    .max(50, "Barangay must be less than 50 characters"),
  street: yup
    .string()
    .required("Street is required")
    .min(2, "Street must be at least 2 characters")
    .max(100, "Street must be less than 100 characters"),
  zipcode: yup
    .string()
    .required("Zipcode is required")
    .matches(/^\d{4}$/, "Zipcode must be exactly 4 digits")
    .length(4, "Zipcode must be exactly 4 digits")
});

// Validation schema for password change
const passwordSchema = yup.object({
  oldPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref('newPassword')], "Passwords must match")
});

const UpdateProfile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    contact: "",
    city: "",
    barangay: "",
    street: "",
    zipcode: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Password change toggle and data
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Fetch current user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:4001/api/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setInitialValues({
          name: data.user.name,
          email: data.user.email,
          contact: data.user.contact || "",
          city: data.user.address?.city || "",
          barangay: data.user.address?.barangay || "",
          street: data.user.address?.street || "",
          zipcode: data.user.address?.zipcode || "",
        });

        setAvatarPreview(data.user.avatar?.url || "");
      } catch (error) {
        setMessage("Failed to load profile");
        console.error(error);
      }
    };
    fetchProfile();
  }, [token]);


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return setAvatarFile(null);

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Image size should be less than 2MB");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Submit profile update
  const handleProfileSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => formData.append(key, value));
      if (avatarFile) formData.append("avatar", avatarFile);

      const { data } = await axios.put(
        "http://localhost:4001/api/v1/me/update",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 1200);
    } catch (error) {
      console.error("Update error:", error);
      setMessage(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Change password handler
  const handlePasswordSubmit = async (values, { resetForm }) => {
    setLoading(true);
    setMessage("");

    try {
      await axios.put(
        "http://localhost:4001/api/v1/password/update",
        {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Password changed successfully!");
      resetForm();
      setShowPasswordForm(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Password update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Update Profile</h2>

      {avatarPreview && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src={avatarPreview}
            alt="Avatar Preview"
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #ddd",
            }}
          />
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={profileSchema}
        validateOnChange={true}
        validateOnBlur={true}
        onSubmit={handleProfileSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form>
            <div>
              <Field
                type="text"
                name="name"
                placeholder="Name"
                className="form-control"
              />
              <ErrorMessage name="name" component="div" className="error-message" />
            </div>
            
            <div>
              <Field
                type="email"
                name="email"
                readOnly
                style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                className="form-control"
              />
              <small style={{ color: "#666" }}>Email cannot be changed</small>
            </div>
            
            <div>
              <Field
                type="text"
                name="contact"
                placeholder="Contact Number"
                className="form-control"
              />
              <ErrorMessage name="contact" component="div" className="error-message" />
            </div>
            
            <div>
              <Field
                type="text"
                name="city"
                placeholder="City"
                className="form-control"
              />
              <ErrorMessage name="city" component="div" className="error-message" />
            </div>
            
            <div>
              <Field
                type="text"
                name="barangay"
                placeholder="Barangay"
                className="form-control"
              />
              <ErrorMessage name="barangay" component="div" className="error-message" />
            </div>
            
            <div>
              <Field
                type="text"
                name="street"
                placeholder="Street"
                className="form-control"
              />
              <ErrorMessage name="street" component="div" className="error-message" />
            </div>
            
            <div>
              <Field
                type="text"
                name="zipcode"
                placeholder="Zipcode"
                className="form-control"
              />
              <ErrorMessage name="zipcode" component="div" className="error-message" />
            </div>

            <div style={{ margin: "10px 0" }}>
              <label htmlFor="avatar-upload" style={{ display: "block", marginBottom: "5px" }}>
                Profile Picture:
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ width: "100%" }}
              />
              <small style={{ color: "#666" }}>Supported: JPG, PNG, GIF (Max 2MB)</small>
            </div>

            <button type="submit" disabled={loading || isSubmitting}>
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </Form>
        )}
      </Formik>

      <hr style={{ margin: "30px 0" }} />

      <div style={{ textAlign: "center" }}>
        {!showPasswordForm ? (
          <button onClick={() => setShowPasswordForm(true)} className="btn-secondary">
            Change Password
          </button>
        ) : (
          <>
            <h3>Change Password</h3>
            <Formik
              initialValues={{
                oldPassword: "",
                newPassword: "",
                confirmPassword: ""
              }}
              validationSchema={passwordSchema}
              validateOnChange={true}
              validateOnBlur={true}
              onSubmit={handlePasswordSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div>
                    <Field
                      type="password"
                      name="oldPassword"
                      placeholder="Current Password"
                      className="form-control"
                    />
                    <ErrorMessage name="oldPassword" component="div" className="error-message" />
                  </div>
                  
                  <div>
                    <Field
                      type="password"
                      name="newPassword"
                      placeholder="New Password"
                      className="form-control"
                    />
                    <ErrorMessage name="newPassword" component="div" className="error-message" />
                  </div>
                  
                  <div>
                    <Field
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm New Password"
                      className="form-control"
                    />
                    <ErrorMessage name="confirmPassword" component="div" className="error-message" />
                  </div>
                  
                  <button type="submit" disabled={loading || isSubmitting}>
                    {loading ? "Changing..." : "Save Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    style={{ marginLeft: "10px" }}
                  >
                    Cancel
                  </button>
                </Form>
              )}
            </Formik>
          </>
        )}
      </div>

      {message && (
        <p
          style={{
            color: message.includes("successfully") ? "green" : "red",
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default UpdateProfile;
