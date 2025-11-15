import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  Stack, 
  CircularProgress 
} from "@mui/material";

const CheckoutConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const cart = location.state?.cart;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const TAX_RATE = 0.1; // 10%
  const SHIPPING_PRICE = 50; // flat shipping fee

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const { data } = await axios.get("http://localhost:4001/api/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch user info:", error.response?.data || error.message);
        if (error.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, navigate]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  if (!cart || !cart.items.length) {
    return <Typography variant="h6" align="center" mt={5}>No items to checkout.</Typography>;
  }

  // Calculate totals
  const itemsPrice = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const taxPrice = itemsPrice * TAX_RATE;
  const totalPrice = itemsPrice + taxPrice + SHIPPING_PRICE;

  // Confirm checkout
  const handleConfirmCheckout = async () => {
    if (!token) {
      alert("You must log in first!");
      navigate("/login");
      return;
    }

    if (!user?.address) {
      alert("Please update your profile with a shipping address first!");
      return;
    }

    setCheckoutLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:4001/api/v1/checkout",
        {}, // backend fetches cart from DB
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        alert("Order placed successfully!");
        navigate("/orders"); // redirect to orders page
      } else {
        alert(res.data.message || "Checkout failed");
      }
    } catch (error) {
      console.error("Checkout failed:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Checkout failed");
      if (error.response?.status === 401) navigate("/login");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>Confirm Your Order</Typography>

      {/* User Info */}
      {user && (
        <Box mb={3} p={2} border="1px solid #ccc" borderRadius={2}>
          <Typography variant="h6">Customer Information</Typography>
          <Typography>Name: {user.name}</Typography>
          {user.address ? (
            <>
              <Typography>Address: {user.address.street}</Typography>
              <Typography>City: {user.address.city}</Typography>
              <Typography>Postal Code: {user.address.zipcode}</Typography>
              <Typography>Country: {user.address.country || "N/A"}</Typography>
              <Typography>Phone: {user.contact || "N/A"}</Typography>
            </>
          ) : (
            <Typography color="error">
              No address found. Please update your profile with a shipping address.
            </Typography>
          )}
        </Box>
      )}

      {/* Cart Items */}
      <Stack spacing={2}>
        {cart.items.map((item) => (
          <Card key={item.product._id} sx={{ display: "flex", p: 1 }}>
            <CardMedia
              component="img"
              sx={{ width: 120, height: 120, objectFit: "cover" }}
              image={item.product.images?.[0]?.url || ""}
              alt={item.product.name}
            />
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h6">{item.product.name}</Typography>
              <Typography>Quantity: {item.quantity}</Typography>
              <Typography>Price: ${item.product.price}</Typography>
              <Typography>Subtotal: ${(item.product.price * item.quantity).toFixed(2)}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Order Summary */}
      <Box mt={3} p={2} border="1px solid #ccc" borderRadius={2}>
        <Typography variant="h6">Order Summary</Typography>
        <Typography>Items Price: ${itemsPrice.toFixed(2)}</Typography>
        <Typography>Tax: ${taxPrice.toFixed(2)}</Typography>
        <Typography>Shipping: ${SHIPPING_PRICE.toFixed(2)}</Typography>
        <Typography variant="h5" mt={1}>Total: ${totalPrice.toFixed(2)}</Typography>
      </Box>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirmCheckout}
          disabled={checkoutLoading || !user?.address}
        >
          {checkoutLoading ? "Processing..." : "Confirm Checkout"}
        </Button>
      </Box>
    </Box>
  );
};

export default CheckoutConfirmation;
