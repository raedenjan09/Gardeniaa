import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Stack, Typography } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "http://localhost:4001/api/v1";

export default function CreateSupplier() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ["name","email","phone","street","city","state","country","zipCode"];
    for (let field of requiredFields) {
      if (!form[field]) {
        toast.error(`Please enter ${field}`, { position: "top-center" });
        return;
      }
    }

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: {
        street: form.street,
        city: form.city,
        state: form.state,
        country: form.country,
        zipCode: form.zipCode,
      },
    };

    try {
      await axios.post(`${BASE_URL}/admin/suppliers`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.success("Supplier created successfully.", { position: "top-center" });
      setTimeout(() => navigate("/admin/suppliers"), 1000);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message, { position: "top-center" });
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4, p: 3, border: "1px solid #ddd", borderRadius: 2 }}>
      <Typography variant="h5" mb={2}>Create Supplier</Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField label="Name*" fullWidth value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
          <TextField label="Email*" type="email" fullWidth value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
          <TextField label="Phone*" fullWidth value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required />
          <TextField label="Street*" fullWidth value={form.street} onChange={e=>setForm({...form,street:e.target.value})} required />
          <TextField label="City*" fullWidth value={form.city} onChange={e=>setForm({...form,city:e.target.value})} required />
          <TextField label="State*" fullWidth value={form.state} onChange={e=>setForm({...form,state:e.target.value})} required />
          <TextField label="Country*" fullWidth value={form.country} onChange={e=>setForm({...form,country:e.target.value})} required />
          <TextField label="Zip Code*" fullWidth value={form.zipCode} onChange={e=>setForm({...form,zipCode:e.target.value})} required />

          <Stack direction="row" spacing={2} mt={2}>
            <Button type="submit" variant="contained">Create Supplier</Button>
            <Button variant="outlined" onClick={()=>navigate("/admin/suppliers")}>Back</Button>
          </Stack>
        </Stack>
      </form>

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </Box>
  );
}
