import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:4001/api/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [token]);

  return (
    <div className="profile-container">
      {user ? (
        <div className="profile-card" style={{ textAlign: "center" }}>
          <img
            src={user.avatar?.url}
            alt={user.name}
            className="avatar"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "15px",
            }}
          />

          {/* USER NAME + VERIFIED BADGE */}
          <h2 style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
            {user.name}
            {user.isVerified && (
              <img
                src="/images/verified.jpg"
                alt="Verified"
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                }}
              />
            )}
          </h2>

          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Contact:</strong> {user.contact}</p>

          <p><strong>Address:</strong></p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><strong>City:</strong> {user.address?.city}</li>
            <li><strong>Barangay:</strong> {user.address?.barangay}</li>
            <li><strong>Street:</strong> {user.address?.street}</li>
            <li><strong>Zipcode:</strong> {user.address?.zipcode}</li>
          </ul>

          <p style={{ marginTop: "10px", color: "#555" }}>
            <strong>Account Created:</strong>{" "}
            {new Date(user.createdAt).toLocaleDateString()}
          </p>

          <a
            href="/update-profile"
            className="btn-update"
            style={{
              display: "inline-block",
              marginTop: "15px",
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "#fff",
              borderRadius: "5px",
              textDecoration: "none",
            }}
          >
            Update Profile
          </a>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default Profile;
