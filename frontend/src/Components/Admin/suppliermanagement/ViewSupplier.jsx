// Gardenia/frontend/src/Components/admin/suppliermanagement/ViewSupplier.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../../layouts/Loader";
import { Button } from "@mui/material";

const BASE_URL = "http://localhost:4001/api/v1";

export default function ViewSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/suppliers/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setSupplier(res.data.supplier || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [id, token]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Loader />
      </div>
    );
  }

  if (!supplier) {
    return <p>Supplier not found.</p>;
  }

  return (
    <div style={{ maxWidth: 800, margin: "24px auto", padding: 16 }}>
      <h2>Supplier Details</h2>
      <div style={{ marginBottom: 16 }}>
        <Button variant="contained" onClick={() => navigate("/admin/suppliers")}>
          ⬅️ Back to Suppliers
        </Button>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
        <p>
          <strong>Name:</strong> {supplier.name}
        </p>
        <p>
          <strong>Email:</strong> {supplier.email}
        </p>
        <p>
          <strong>Phone:</strong> {supplier.phone}
        </p>
        <p>
          <strong>City:</strong> {supplier.address?.city || "—"}
        </p>
        <p>
          <strong>Street:</strong> {supplier.address?.street || "—"}
        </p>
        <p>
          <strong>Status:</strong> {supplier.isActive ? "Active" : "Deleted"}
        </p>
      </div>
    </div>
  );
}
