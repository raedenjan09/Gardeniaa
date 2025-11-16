import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Avatar,
  Stack,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const API_BASE = "http://localhost:4001/api/v1";

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchAdminProfile();
  }, [token, navigate]);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const adminData = data.user;
      setAdmin(adminData);
      setFormData({
        name: adminData.name || "",
        email: adminData.email || "",
        contact: adminData.contact || "",
      });
      if (adminData.avatar?.url) {
        setAvatarPreview(adminData.avatar.url);
      }
    } catch (err) {
      console.error("Failed to fetch admin profile:", err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      setError("");
      setMessage("");

      const updateData = new FormData();
      updateData.append("name", formData.name);
      updateData.append("contact", formData.contact);

      if (avatarFile) {
        updateData.append("avatar", avatarFile);
      }

      const { data } = await axios.put(`${API_BASE}/me/update`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.user) {
        setAdmin(data.user);
        // Update localStorage user data
        localStorage.setItem("user", JSON.stringify(data.user));
        // Dispatch custom event to trigger AdminLayout refresh
        window.dispatchEvent(new Event('profileUpdated'));
        setMessage("Profile updated successfully!");
        setAvatarFile(null);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(
        err.response?.data?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, md: 4 }} maxWidth={600} mx="auto">
      <Typography variant="h4" mb={3} fontWeight="bold">
        Admin Profile
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Avatar Section */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        mb={4}
        p={3}
        sx={{
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
        }}
      >
        <Avatar
          src={avatarPreview}
          alt={formData.name}
          sx={{
            width: 120,
            height: 120,
            mb: 2,
            border: "3px solid #1976d2",
          }}
        />

        <Typography variant="subtitle1" mb={2}>
          Profile Picture
        </Typography>

        <Box position="relative" mb={2}>
          <input
            accept="image/*"
            type="file"
            id="avatar-input"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
          <label htmlFor="avatar-input">
            <Button
              variant="contained"
              color="primary"
              component="span"
              startIcon={<CloudUploadIcon />}
            >
              Upload Avatar
            </Button>
          </label>
        </Box>

        {avatarFile && (
          <Typography variant="caption" color="success.main">
            ✓ New image selected (changes saved after update)
          </Typography>
        )}
      </Box>

      {/* Form Section */}
      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          variant="outlined"
        />

        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          variant="outlined"
          disabled
        />

        <TextField
          fullWidth
          label="Contact Number"
          name="contact"
          value={formData.contact}
          onChange={handleInputChange}
          placeholder="Enter your contact number"
          variant="outlined"
        />

        {/* Account Info */}
        <Box p={2} sx={{ backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
            Account Information
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={0.5}>
            <strong>Role:</strong> {admin?.role === "admin" ? "Administrator" : "User"}
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={0.5}>
            <strong>Account Created:</strong>{" "}
            {new Date(admin?.createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Last Updated:</strong>{" "}
            {new Date(admin?.updatedAt).toLocaleDateString()}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate("/admin/dashboard")}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateProfile}
            disabled={updating}
          >
            {updating ? "Updating..." : "Update Profile"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default AdminProfile;
