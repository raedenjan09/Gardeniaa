import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Rating,
  Divider,
  Stack,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:4001/api/v1/products/${productId}`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        setProduct(data.product);

        // Fetch reviews
        const reviewsRes = await axios.get(
          `http://localhost:4001/api/v1/reviews/${productId}`
        );
        setReviews(reviewsRes.data.reviews || []);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, token]);

  const handleAddToCart = async () => {
    if (!token) {
      alert("Please log in to add products to your cart.");
      return;
    }
    setAddingToCart(true);
    try {
      await axios.post(
        "http://localhost:4001/api/v1/cart/add",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Product added to cart!");
      // Trigger cart update event for header
      window.dispatchEvent(new Event('cartUpdated'));
      // Refresh the page to update the cart count
      window.location.reload();
    } catch (error) {
      console.error("Failed to add product to cart", error);
      alert(error.response?.data?.message || "Failed to add product to cart.");
    } finally {
      setAddingToCart(false);
    }
  };

  const nextImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + product.images.length) % product.images.length
      );
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  if (!product)
    return (
      <Box p={3}>
        <Typography>Product not found.</Typography>
        <Button onClick={() => navigate("/home")}>Back to Home</Button>
      </Box>
    );

  return (
    <Box p={3} maxWidth={1200} mx="auto">
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/home")}
        sx={{ mb: 2 }}
      >
        Back to Products
      </Button>

      <Box display={{ xs: "block", md: "flex" }} gap={3}>
        {/* Product Images */}
        <Box flex={1}>
          <Box position="relative" mb={2}>
            <img
              src={product.images?.[currentImageIndex]?.url}
              alt={product.name}
              style={{
                width: "100%",
                height: "400px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
            {product.images && product.images.length > 1 && (
              <>
                <Button
                  onClick={prevImage}
                  sx={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                  }}
                >
                  ‹
                </Button>
                <Button
                  onClick={nextImage}
                  sx={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                  }}
                >
                  ›
                </Button>
              </>
            )}
          </Box>

          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <Box display="flex" gap={1} mb={2}>
              {product.images.map((img, idx) => (
                <Box
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  sx={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    border: currentImageIndex === idx ? "2px solid #007bff" : "1px solid #ddd",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={img.url}
                    alt={`thumbnail-${idx}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Product Info */}
        <Box flex={1}>
          <Typography variant="h4" mb={1}>
            {product.name}
          </Typography>

          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Rating value={Number(product.ratings || 0)} readOnly />
            <Typography variant="body2" color="textSecondary">
              ({product.numOfReviews || 0} reviews)
            </Typography>
          </Box>

          <Typography variant="h5" color="success.main" mb={2}>
            ${product.price}
          </Typography>

          <Typography variant="body1" mb={2} color="textSecondary">
            {product.description}
          </Typography>

          <Box mb={2}>
            <Typography variant="subtitle1">
              <strong>Category:</strong> {product.category}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Stock:</strong>{" "}
              <span style={{ color: product.stock > 0 ? "green" : "red" }}>
                {product.stock > 0 ? `${product.stock} available` : "Out of Stock"}
              </span>
            </Typography>
          </Box>

          {/* Reviews Section - Inline */}
          <Box mb={3} p={2} border="1px solid #ddd" borderRadius={2} backgroundColor="#f9f9f9">
            <Typography variant="h6" mb={2}>
              Customer Reviews ({reviews.length})
            </Typography>

            {reviews.length === 0 ? (
              <Typography color="textSecondary" variant="body2">No reviews yet.</Typography>
            ) : (
              <Stack spacing={1.5} maxHeight="300px" sx={{ overflowY: "auto", pr: 1 }}>
                {reviews.map((review) => (
                  <Box
                    key={review._id}
                    p={1.5}
                    borderRadius={1}
                    backgroundColor="#fff"
                    border="1px solid #eee"
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {review.name || review.user?.name || "User"}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.3}>
                        {[...Array(Number(review.rating))].map((_, i) => (
                          <StarIcon key={i} sx={{ fontSize: "16px", color: "#ffc107" }} />
                        ))}
                      </Box>
                    </Box>
                    <Typography variant="body2" mb={0.5}>
                      {review.comment}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}

            {/* Review functionality is only available in Order History for delivered orders */}
          </Box>

          <Box display="flex" gap={2} mb={3}>
            <Button
              variant="contained"
              color="primary"
              startIcon={addingToCart ? <CircularProgress size={16} /> : <ShoppingCartIcon />}
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || addingToCart}
              fullWidth
            >
              {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductDetail;
