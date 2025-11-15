import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Stack,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const { data } = await axios.get("http://localhost:4001/api/v1/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(data.cart || { items: [] });
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        setCart({ items: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token, navigate]);

  const handleQuantityChange = async (productId, action) => {
    try {
      const { data } = await axios.patch(
        "http://localhost:4001/api/v1/cart/update",
        { productId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(data.cart || { items: [] });
    } catch (error) {
      console.error("Failed to update cart:", error);
    }
  };

  const handleRemove = async (productId) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:4001/api/v1/cart/remove/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(data.cart || { items: [] });
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleRemoveAll = async () => {
    try {
      await axios.delete("http://localhost:4001/api/v1/cart/remove-all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart({ items: [] });
    } catch (error) {
      console.error("Failed to remove all items:", error);
    }
  };

  const handleCheckout = () => {
    navigate("/checkout-confirmation", { state: { cart } });
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  if (!cart.items.length)
    return (
      <Typography variant="h6" align="center" mt={5}>
        Your cart is empty.
      </Typography>
    );

  const total = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        Your Shopping Cart
      </Typography>

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
              <Typography>Price: ${item.product.price}</Typography>
              <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                <IconButton
                  onClick={() => handleQuantityChange(item.product._id, "decrease")}
                  disabled={item.quantity <= 1}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography>{item.quantity}</Typography>
                <IconButton
                  onClick={() => handleQuantityChange(item.product._id, "increase")}
                  disabled={item.quantity >= item.product.stock}
                >
                  <AddIcon />
                </IconButton>
              </Stack>
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                sx={{ mt: 1 }}
                onClick={() => handleRemove(item.product._id)}
              >
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Total: ${total}</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="error" onClick={handleRemoveAll}>
            Remove All
          </Button>
          <Button variant="contained" color="primary" onClick={handleCheckout}>
            Checkout
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default Cart;
