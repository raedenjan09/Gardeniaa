// Gardenia/frontend/src/Components/admin/usermanagement/ViewUser.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../../layouts/Loader";
import { Button } from "@mui/material";

const BASE_URL = "http://localhost:4001/api/v1";

export default function ViewUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <h2>User not found</h2>
        <Button variant="contained" onClick={() => navigate("/admin/users")}>
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "24px auto", padding: 16 }}>
      <h2>User Details</h2>

      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <strong>Name:</strong>
        <span>{user.name}</span>
        {user.isVerified && (
          <img
            src="/images/verified.jpg"
            alt="Verified"
            style={{ width: 20, height: 20 }}
          />
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Avatar:</strong>
        <div>
          <img
            src={user.avatar?.url || "https://res.cloudinary.com/demo/image/upload/v1690000000/default-avatar.png"}
            alt={user.name}
            style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", marginTop: 8 }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Email:</strong> {user.email}
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Contact:</strong> {user.contact || "-"}
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Address:</strong>
        <div>
          {user.address?.street && <div>Street: {user.address.street}</div>}
          {user.address?.barangay && <div>Barangay: {user.address.barangay}</div>}
          {user.address?.city && <div>City: {user.address.city}</div>}
          {user.address?.zipcode && <div>Zipcode: {user.address.zipcode}</div>}
          {!user.address?.street && !user.address?.barangay && !user.address?.city && !user.address?.zipcode && <div>-</div>}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Role:</strong> {user.role}
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Status:</strong> {user.isActive ? "Active" : "Inactive"}
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Created At:</strong> {new Date(user.createdAt).toLocaleString()}
      </div>

      <Button variant="contained" onClick={() => navigate("/admin/users")}>
        Back to Users
      </Button>
    </div>
  );
}
