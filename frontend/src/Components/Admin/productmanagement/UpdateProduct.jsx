// Gardenia/frontend/src/Components/admin/productmanagement/UpdateProduct.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  TextField,
  Button,
  MenuItem,
  Typography,
  Box,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Grid,
  IconButton,
  Card,
  CardMedia,
  Stack
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "http://localhost:4001/api/v1";

const categories = [
  "Indoor Plants",
  "Outdoor Plants",
  "Seeds",
  "Soil & Fertilizers",
  "Tools & Accessories",
  "Planters & Pots",
];

export default function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: categories[0],
    supplier: "",
    stock: 0,
  });
  const [suppliers, setSuppliers] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchSuppliers();
    }
    // eslint-disable-next-line
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/products/${id}`);
      const product = res.data.product;
      setForm({
        name: product.name || "",
        price: product.price || "",
        description: product.description || "",
        category: product.category || categories[0],
        supplier: product.supplier?._id || "",
        stock: product.stock || 0,
      });
      setExistingImages(product.images || []);
    } catch (err) {
      toast.error("Failed to load product", { position: "top-center" });
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/suppliers/dropdown`);
      setSuppliers(res.data.suppliers || []);
    } catch (err) {
      toast.error("Failed to fetch suppliers", { position: "top-center" });
    }
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNewFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const previews = [];
    const validFiles = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select only image files", { position: "top-center" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Each image must be less than 5MB", { position: "top-center" });
        return;
      }
      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === validFiles.length) {
          setNewPreviews((prev) => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setNewFiles((prev) => [...prev, ...validFiles]);
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.name || !form.price || !form.description) {
      toast.error("Please fill all required fields", { position: "top-center" });
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", parseFloat(form.price));
      formData.append("description", form.description);
      formData.append("category", form.category);
      if (form.supplier) formData.append("supplier", form.supplier);
      formData.append("stock", parseInt(form.stock, 10));
      formData.append("existingImages", JSON.stringify(existingImages));
      newFiles.forEach((file) => formData.append("images", file));

      await axios.put(`${BASE_URL}/admin/products/${id}`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setLoading(false);
      toast.success("Product updated successfully", { position: "top-center" });
      setTimeout(() => navigate("/admin/products"), 1000);
    } catch (err) {
      setLoading(false);
      toast.error(err?.response?.data?.message || err.message, { position: "top-center" });
    }
  };

  if (!form.name && !loading) return <div style={{ maxWidth: 700, margin: "24px auto" }}>Loading...</div>;

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3, border: "1px solid #ddd", borderRadius: 2 }}>
      <Typography variant="h5" mb={2}>
        Update Product
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Name*"
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Price*"
            type="number"
            fullWidth
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <TextField
            label="Description*"
            multiline
            rows={4}
            fullWidth
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <FormControl fullWidth>
            <InputLabel>Category*</InputLabel>
            <Select
              value={form.category}
              label="Category*"
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Supplier</InputLabel>
            <Select
              value={form.supplier}
              label="Supplier"
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
            >
              <MenuItem value="">-- None --</MenuItem>
              {suppliers.map((s) => (
                <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Stock*"
            type="number"
            fullWidth
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />

          {/* Existing images */}
          <Typography>Existing Images:</Typography>
          <Grid container spacing={2}>
            {existingImages.length === 0 && <Typography color="text.secondary">No existing images</Typography>}
            {existingImages.map((img, idx) => (
              <Grid item key={idx}>
                <Card sx={{ position: "relative", width: 100, height: 100 }}>
                  <CardMedia
                    component="img"
                    image={img.url}
                    alt={`img-${idx}`}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <IconButton
                    size="small"
                    sx={{ position: "absolute", top: -5, right: -5, bgcolor: "error.main", color: "white" }}
                    onClick={() => removeExistingImage(idx)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* New files */}
          <Button variant="contained" component="label">
            Choose New Images* (Max 5, 5MB each)
            <input type="file" hidden multiple accept="image/*" onChange={handleNewFileChange} />
          </Button>
          {newPreviews.length > 0 && (
            <Grid container spacing={2}>
              {newPreviews.map((p, i) => (
                <Grid item key={i}>
                  <Card sx={{ position: "relative", width: 100, height: 100 }}>
                    <CardMedia
                      component="img"
                      image={p}
                      alt={`new-${i}`}
                      sx={{ width: "100%", height: "100%", objectFit: "cover", border: "2px solid #007bff" }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: "absolute", top: -5, right: -5, bgcolor: "error.main", color: "white" }}
                      onClick={() => removeNewFile(i)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Stack direction="row" spacing={2} mt={2}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={18} /> : "Update Product"}
            </Button>
            <Button variant="outlined" onClick={() => navigate("/admin/products")}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </form>

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </Box>
  );
}
