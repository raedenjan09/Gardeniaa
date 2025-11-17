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
  Stack,
  FormHelperText
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const BASE_URL = "http://localhost:4001/api/v1";

const categories = [
  "Indoor Plants",
  "Outdoor Plants",
  "Seeds",
  "Soil & Fertilizers",
  "Tools & Accessories",
  "Planters & Pots",
];

// Validation schema
const productSchema = yup.object({
  name: yup
    .string()
    .required("Product name is required")
    .min(3, "Product name must be at least 3 characters"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required")
    .positive("Price must be positive")
    .min(0.01, "Price must be at least 0.01"),
  description: yup
    .string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),
  category: yup.string().required("Category is required"),
  supplier: yup.string().optional(),
  stock: yup
    .number()
    .typeError("Stock must be a number")
    .required("Stock is required")
    .integer("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .max(1000, "Stock cannot exceed 1000")
});

export default function CreateProduct() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [suppliers, setSuppliers] = useState([]);
  const [imagesFiles, setImagesFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
      category: categories[0],
      supplier: "",
      stock: ""
    }
  });

  const watchedCategory = watch("category");

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

  const onSubmit = async (data) => {
    if (imagesFiles.length === 0) {
      toast.error("Please select at least one image for the item.", { position: "top-center" });
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("price", parseFloat(data.price));
    formData.append("description", data.description);
    formData.append("category", data.category);
    if (data.supplier) formData.append("supplier", data.supplier);
    formData.append("stock", parseInt(data.stock, 10));
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

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name*"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Price*"
                type="number"
                fullWidth
                error={!!errors.price}
                helperText={errors.price?.message}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description*"
                multiline
                rows={4}
                fullWidth
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />
          <FormControl fullWidth error={!!errors.category}>
            <InputLabel>Category*</InputLabel>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Category*">
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
          </FormControl>
          <FormControl fullWidth error={!!errors.supplier}>
            <InputLabel>Supplier</InputLabel>
            <Controller
              name="supplier"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Supplier">
                  <MenuItem value="">-- None --</MenuItem>
                  {suppliers.map((s) => (
                    <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.supplier && <FormHelperText>{errors.supplier.message}</FormHelperText>}
          </FormControl>
          <Controller
            name="stock"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Stock*"
                type="number"
                fullWidth
                error={!!errors.stock}
                helperText={errors.stock?.message}
              />
            )}
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
