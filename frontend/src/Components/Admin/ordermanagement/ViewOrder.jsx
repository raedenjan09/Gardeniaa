// Gardenia/frontend/src/Components/admin/ordermanagement/ViewOrder.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Divider,
} from "@mui/material";
import Loader from "../../layouts/Loader";

const BASE_URL = "http://localhost:4001/api/v1";

export default function ViewOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line
  }, []);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data.order);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !order) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Loader />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#f0f2f5",
        p: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 900,
          width: "100%",
          bgcolor: "#fff",
          borderRadius: 2,
          p: 4,
          boxShadow: 3,
          position: "relative",
        }}
      >
        {/* Back Button Top Left */}
        <Box sx={{ position: "absolute", top: 16, left: 16 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate("/admin/orders")}
          >
            Back
          </Button>
        </Box>

        <Typography variant="h5" mb={3} textAlign="center">
          View Order Details
        </Typography>

        {/* Order & User Info */}
        <Box mb={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Order ID:</strong> {order._id}</Typography>
              <Typography>
                <strong>User:</strong> {order.user?.name || "N/A"}{" "}
                {order.user?.isVerified && (
                  <img
                    src="/images/verified.png"
                    alt="Verified"
                    style={{ height: 20, verticalAlign: "middle", marginLeft: 6 }}
                  />
                )}
              </Typography>
              <Typography><strong>Email:</strong> {order.user?.email || "N/A"}</Typography>
              {order.shippingInfo && (
                <Box mt={1}>
                  <Typography><strong>Address:</strong></Typography>
                  <Typography>
                    {order.shippingInfo.address}, {order.shippingInfo.city},{" "}
                    {order.shippingInfo.postalCode}, {order.shippingInfo.country}
                  </Typography>
                  <Typography><strong>Phone:</strong> {order.shippingInfo.phoneNo}</Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography><strong>Status:</strong> {order.orderStatus}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Products */}
        <Typography variant="h6" mb={2}>
          Products
        </Typography>
        <Grid container spacing={2}>
          {order.orderItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id || item.product}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={item.image}
                  alt={item.name}
                />
                <CardContent>
                  <Typography variant="body1" fontWeight="bold">
                    {item.name}
                  </Typography>
                  <Typography variant="body2">Quantity: {item.quantity}</Typography>
                  <Typography variant="body2">Price: ₱{item.price.toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Pricing Summary */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <Typography><strong>Items Total:</strong> ₱{order.itemsPrice.toFixed(2)}</Typography>
         <Typography><strong>Tax:</strong> ₱{order.taxPrice.toFixed(2)}</Typography>
         <Typography><strong>Shipping Fee:</strong> ₱{order.shippingPrice.toFixed(2)}</Typography>
         <Typography variant="h6" mt={1}><strong>Total Price:</strong> ₱{order.totalPrice.toFixed(2)}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
