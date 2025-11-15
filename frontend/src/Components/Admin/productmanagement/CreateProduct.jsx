import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

export default function CreateProduct() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: categories[0],
    supplier: "",
    stock: "",
  });
  const [suppliers, setSuppliers] = useState([]);
  const [imagesFiles, setImagesFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/suppliers/dropdown`);
        if (res.data?.suppliers) setSuppliers(res.data.suppliers);
      } catch (err) {
        console.error("fetch suppliers error", err);
        toast.error("Failed to fetch suppliers", { position: "top-center" });
      }
    };
    fetchSuppliers();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalSize = files.reduce((t, f) => t + f.size, 0);
    if (totalSize > 10 * 1024 * 1024) {
      toast.error("Total images size should be less than 10MB", { position: "top-center" });
      return;
    }

    const validFiles = [];
    const previews = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select only image files", { position: "top-center" });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`Image ${file.name} should be less than 2MB`, { position: "top-center" });
        return;
      }
      validFiles.push(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === validFiles.length) {
          setImagePreviews((prev) => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImagesFiles((prev) => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setImagesFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.description || !form.stock) {
      toast.error("Please fill in all required garden item details.", { position: "top-center" });
      return;
    }

    if (imagesFiles.length === 0) {
      toast.error("Please select at least one image for the item.", { position: "top-center" });
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", parseFloat(form.price));
    formData.append("description", form.description);
    formData.append("category", form.category);
    if (form.supplier) formData.append("supplier", form.supplier);
    formData.append("stock", parseInt(form.stock, 10));
    imagesFiles.forEach((file) => formData.append("images", file));

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/admin/products`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setLoading(false);
      toast.success("Item added to Gardenia successfully.", { position: "top-center" });
      setTimeout(() => navigate("/admin/products"), 1000);
    } catch (error) {
      setLoading(false);
      const text = error?.response?.data?.message || error.message;
      toast.error(text, { position: "top-center" });
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3, border: "1px solid #ddd", borderRadius: 2 }}>
      <Typography variant="h5" mb={2}>
        Add Garden Item
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

          <Button variant="contained" component="label">
            Upload Images (plants, seeds, tools) • Max 5, 2MB each
            <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
          </Button>

          {imagePreviews.length > 0 && (
            <Grid container spacing={2}>
              {imagePreviews.map((preview, index) => (
                <Grid key={index}>
                  <Card sx={{ position: "relative", width: 100, height: 100 }}>
                    <CardMedia
                      component="img"
                      image={preview}
                      alt={`Preview ${index + 1}`}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: "absolute", top: -5, right: -5, bgcolor: "error.main", color: "white" }}
                      onClick={() => removeImage(index)}
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
              {loading ? <CircularProgress size={18} /> : "Add Item"}
            </Button>
            <Button variant="outlined" onClick={() => navigate("/admin/products")}>
              Back to Items
            </Button>
          </Stack>
        </Stack>
      </form>

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </Box>
  );
}
