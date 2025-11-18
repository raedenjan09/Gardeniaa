// Gardenia/frontend/src/Components/admin/suppliermanagement/ViewSupplier.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../../layouts/Loader";
import { Button, Box, Typography, Paper, Grid, Chip, Divider } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
        const res = await axios.get(`${BASE_URL}/admin/suppliers/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setSupplier(res.data.supplier || null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load supplier details.", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [id, token]);

  const handleSoftDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    
    try {
      await axios.delete(`${BASE_URL}/admin/suppliers/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.success("Supplier deleted successfully.", { position: "top-center" });
      setTimeout(() => navigate("/admin/suppliers"), 1000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete supplier.", { position: "top-center" });
    }
  };

  const handleRestore = async () => {
    try {
      await axios.patch(`${BASE_URL}/admin/suppliers/restore/${id}`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.success("Supplier restored successfully.", { position: "top-center" });
      setTimeout(() => navigate("/admin/suppliers"), 1000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to restore supplier.", { position: "top-center" });
    }
  };

  const handlePermanentDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this supplier? This action cannot be undone.")) return;
    
    try {
      await axios.delete(`${BASE_URL}/admin/suppliers/delete/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.success("Supplier permanently deleted.", { position: "top-center" });
      setTimeout(() => navigate("/admin/suppliers"), 1000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete supplier.", { position: "top-center" });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Loader />
      </Box>
    );
  }

  if (!supplier) {
    return (
      <Box sx={{ maxWidth: 800, margin: "24px auto", padding: 16, textAlign: "center" }}>
        <Typography variant="h5" color="error">Supplier not found.</Typography>
        <Button variant="contained" onClick={() => navigate("/admin/suppliers")} sx={{ mt: 2 }}>
          Back to Suppliers
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: "24px auto", padding: 16 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Supplier Details</Typography>
        <Button variant="outlined" onClick={() => navigate("/admin/suppliers")}>
          ⬅️ Back to Suppliers
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Name</Typography>
                <Typography variant="body1">{supplier.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Email</Typography>
                <Typography variant="body1">{supplier.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Phone</Typography>
                <Typography variant="body1">{supplier.phone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Chip
                  label={supplier.isActive ? "Active" : "Deleted"}
                  color={supplier.isActive ? "success" : "error"}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Address Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Address</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Street</Typography>
                <Typography variant="body1">{supplier.address?.street || "—"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">City</Typography>
                <Typography variant="body1">{supplier.address?.city || "—"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">State</Typography>
                <Typography variant="body1">{supplier.address?.state || "—"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Country</Typography>
                <Typography variant="body1">{supplier.address?.country || "—"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Zip Code</Typography>
                <Typography variant="body1">{supplier.address?.zipCode || "—"}</Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Products Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Associated Products</Typography>
            <Divider sx={{ mb: 2 }} />
            {supplier.products && supplier.products.length > 0 ? (
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {supplier.products.length} product(s) associated with this supplier
                </Typography>
                {supplier.products.slice(0, 5).map((product, index) => (
                  <Chip
                    key={index}
                    label={`${product.name} - $${product.price}`}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
                {supplier.products.length > 5 && (
                  <Typography variant="body2" color="textSecondary">
                    ... and {supplier.products.length - 5} more products
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No products associated with this supplier
              </Typography>
            )}
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {supplier.isActive ? (
                <>
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/admin/suppliers/edit/${supplier._id}`)}
                  >
                    Edit Supplier
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleSoftDelete}
                  >
                    Delete Supplier
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleRestore}
                  >
                    Restore Supplier
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handlePermanentDelete}
                  >
                    Permanently Delete
                  </Button>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </Box>
  );
}
