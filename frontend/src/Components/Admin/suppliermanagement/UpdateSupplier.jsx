// Gardenia/frontend/src/Components/admin/suppliermanagement/UpdateSupplier.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "http://localhost:4001/api/v1";

export default function UpdateSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [supplier, setSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    address: { street: "", city: "", state: "", country: "", zipCode: "" },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSupplier() {
      try {
        const res = await axios.get(`${BASE_URL}/admin/suppliers/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.data.supplier) {
          const fetchedSupplier = {
            ...res.data.supplier,
            address: res.data.supplier.address || { street: "", city: "", state: "", country: "", zipCode: "" },
          };
          setSupplier(fetchedSupplier);
        } else {
          toast.error("Supplier not found.", { position: "top-center" });
        }
      } catch (err) {
        toast.error("Failed to load supplier data.", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    }

    fetchSupplier();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setSupplier((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setSupplier((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Validate all required fields
    const requiredFields = [
      "name",
      "email",
      "phone",
      "street",
      "city",
      "state",
      "country",
      "zipCode",
    ];
    for (let field of requiredFields) {
      if (field in supplier) {
        if (!supplier[field]) {
          toast.error(`Please enter ${field}`, { position: "top-center" });
          return;
        }
      } else if (field in supplier.address) {
        if (!supplier.address[field]) {
          toast.error(`Please enter ${field}`, { position: "top-center" });
          return;
        }
      }
    }

    try {
      await axios.put(`${BASE_URL}/admin/suppliers/${id}`, supplier, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.success("Supplier updated successfully.", { position: "top-center" });
      setTimeout(() => navigate("/admin/suppliers"), 1000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update supplier.", { position: "top-center" });
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <CircularProgress />
        <Typography mt={2}>Loading supplier details...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4, p: 3, border: "1px solid #ddd", borderRadius: 2 }}>
      <Typography variant="h5" mb={2}>Update Supplier</Typography>

      <form onSubmit={handleUpdate}>
        <Stack spacing={2}>
          <TextField
            label="Name*"
            name="name"
            fullWidth
            required
            value={supplier.name || ""}
            onChange={handleChange}
          />
          <TextField
            label="Email*"
            name="email"
            type="email"
            fullWidth
            required
            value={supplier.email || ""}
            onChange={handleChange}
          />
          <TextField
            label="Phone*"
            name="phone"
            fullWidth
            required
            value={supplier.phone || ""}
            onChange={handleChange}
          />
          <TextField
            label="Street*"
            name="address.street"
            fullWidth
            required
            value={supplier.address?.street || ""}
            onChange={handleChange}
          />
          <TextField
            label="City*"
            name="address.city"
            fullWidth
            required
            value={supplier.address?.city || ""}
            onChange={handleChange}
          />
          <TextField
            label="State*"
            name="address.state"
            fullWidth
            required
            value={supplier.address?.state || ""}
            onChange={handleChange}
          />
          <TextField
            label="Country*"
            name="address.country"
            fullWidth
            required
            value={supplier.address?.country || ""}
            onChange={handleChange}
          />
          <TextField
            label="Zip Code*"
            name="address.zipCode"
            fullWidth
            required
            value={supplier.address?.zipCode || ""}
            onChange={handleChange}
          />

          <Stack direction="row" spacing={2} mt={2}>
            <Button type="submit" variant="contained">Update Supplier</Button>
            <Button variant="outlined" onClick={() => navigate("/admin/suppliers")}>Cancel</Button>
          </Stack>
        </Stack>
      </form>

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </Box>
  );
}
