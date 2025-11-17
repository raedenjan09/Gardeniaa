import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import apiClient from "../../config/axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Button,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import StarIcon from "@mui/icons-material/Star";

const BASE_URL = "http://localhost:4001/api/v1";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [productReviews, setProductReviews] = useState({});
  const [productData, setProductData] = useState({});
  const [loading, setLoading] = useState(true);
  const [markingDelivered, setMarkingDelivered] = useState({});
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrdersAndReviews = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Fetch user's orders
        const { data } = await axios.get(`${BASE_URL}/orders/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const ordersData = data.orders || [];
        setOrders(ordersData);

        // Collect all unique product IDs
        const allProductIds = [
          ...new Set(ordersData.flatMap((order) => order.orderItems.map((item) => item.product))),
        ];

        const reviewMap = {};
        const productDataMap = {};

        // Fetch each product and find user's review
        for (const productId of allProductIds) {
          try {
            const { data: productData } = await axios.get(
              `${BASE_URL}/products/${productId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            const product = productData.product;
            if (!product) continue;

            // Store product data including images - extract URLs from image objects
            const imageUrls = (product.images || []).map(img => img.url || img);
            console.log(`Product ${productId} images:`, imageUrls);
            productDataMap[productId] = {
              images: imageUrls,
              name: product.name,
            };

            if (!product.reviews) continue;

            // Normalize IDs to string for comparison
            const myReview = product.reviews.find((rev) => {
              const reviewUserId =
                typeof rev.user === "object" ? rev.user._id : rev.user;
              return reviewUserId === user._id;
            });

            reviewMap[productId] = myReview || null;
          } catch (err) {
            console.warn(`Failed to fetch product ${productId} reviews`, err);
          }
        }

        setProductReviews(reviewMap);
        setProductData(productDataMap);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndReviews();
  }, [token, navigate, user._id]);

  const handleReview = (productId) => {
    navigate(`/review/${productId}`);
  };

  const handleMarkAsDelivered = async (orderId) => {
    setMarkingDelivered({ ...markingDelivered, [orderId]: true });
    try {
      const { data } = await apiClient.patch(`/orders/${orderId}/delivered`);
      
      // Update the order status in the local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, orderStatus: "Delivered", deliveredAt: new Date() } : order
      ));
      
      alert("Order marked as received!");
    } catch (error) {
      console.error("Failed to mark order as delivered:", error);
      alert(error.response?.data?.message || "Failed to mark order as delivered.");
    } finally {
      setMarkingDelivered({ ...markingDelivered, [orderId]: false });
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  if (!orders.length)
    return (
      <Typography variant="h6" align="center" mt={5}>
        You have no orders yet.
      </Typography>
    );

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3} display="flex" alignItems="center" gap={1}>
        <HistoryIcon /> Your Order History
      </Typography>

      <Stack spacing={2}>
        {orders.map((order) => (
          <Card key={order._id} sx={{ p: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6">Order ID: {order._id}</Typography>
                  <Typography>
                    Order Status: <strong style={{ color: order.orderStatus === 'Delivered' ? 'green' : 'orange' }}>{order.orderStatus}</strong>
                  </Typography>
                </Box>
                {order.orderStatus === "Out for Delivery" && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleMarkAsDelivered(order._id)}
                    disabled={markingDelivered[order._id]}
                  >
                    {markingDelivered[order._id] ? "Marking..." : "Mark as Received"}
                  </Button>
                )}
              </Box>

              <Typography>Total Price: ${order.totalPrice.toFixed(2)}</Typography>
              <Typography>
                Placed on:{" "}
                {new Date(order.createdAt).toLocaleDateString()}{" "}
                {new Date(order.createdAt).toLocaleTimeString()}
              </Typography>
              {order.deliveredAt && (
                <Typography color="success.main">
                  Delivered on: {new Date(order.deliveredAt).toLocaleDateString()}
                </Typography>
              )}

              <Box mt={2}>
                <Typography variant="subtitle1">Items:</Typography>
                <Stack spacing={2} mt={1}>
                  {order.orderItems.map((item) => {
                    const myReview = productReviews[item.product];
                    const productImage = item.image || productData[item.product]?.images?.[0];
                    
                    console.log(`Order item: ${item.name}, Image from order:`, item.image, "Fallback:", productData[item.product]?.images?.[0]);
                    
                    return (
                      <Box
                        key={item.product}
                        p={2}
                        border="1px solid #ddd"
                        borderRadius={2}
                      >
                        <Box
                          display="flex"
                          gap={2}
                          alignItems="flex-start"
                        >
                          {productImage && (
                            <Box
                              component="img"
                              src={productImage}
                              alt={item.name}
                              sx={{
                                width: 100,
                                height: 100,
                                objectFit: "cover",
                                borderRadius: 1,
                                flexShrink: 0,
                                cursor: "pointer",
                                backgroundColor: "#f0f0f0",
                              }}
                              onClick={() => navigate(`/product/${item.product}`)}
                              onError={(e) => {
                                console.error("Image failed to load:", productImage);
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <Box flex={1}>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography>
                                {item.name} (x{item.quantity})
                              </Typography>
                              <Typography>
                                ${(item.price * item.quantity).toFixed(2)}
                              </Typography>
                            </Box>

                            {/* Review Section */}
                            <Box mt={1}>
                              {order.orderStatus === "Delivered" ? (
                                myReview ? (
                                  <>
                                    <Typography variant="subtitle2" mt={1}>
                                      Your Review:
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      {[...Array(myReview.rating)].map((_, i) => (
                                        <StarIcon key={i} color="warning" />
                                      ))}
                                    </Box>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontStyle: "italic", mt: 0.5 }}
                                    >
                                      "{myReview.comment}"
                                    </Typography>

                                    <Button
                                      variant="outlined"
                                      color="success"
                                      size="small"
                                      sx={{ mt: 1 }}
                                      onClick={() => handleReview(item.product)}
                                    >
                                      Edit Review
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    variant="outlined"
                                    color="secondary"
                                    size="small"
                                    sx={{ mt: 1 }}
                                    onClick={() => handleReview(item.product)}
                                  >
                                    Write Review
                                  </Button>
                                )
                              ) : (
                                <Typography variant="body2" color="textSecondary">
                                  You can review this product once the order is marked as received.
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Box mt={3} display="flex" justifyContent="center">
        <Button variant="contained" color="primary" onClick={() => navigate("/home")}>
          Back to Home
        </Button>
      </Box>
    </Box>
  );
};

export default OrderHistory;
