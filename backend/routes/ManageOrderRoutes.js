const express = require("express");
const router = express.Router();

const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/ManageOrderController");
const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');



router.get("/admin/orders",isAuthenticatedUser,isAdmin, getAllOrders);

// Get single order by ID
router.get("/admin/orders/:id",isAuthenticatedUser,isAdmin, getOrderById);

// Update order status
router.put("/admin/orders/:id",isAuthenticatedUser,isAdmin, updateOrderStatus);

// Delete order
router.delete("/admin/orders/:id",isAuthenticatedUser,isAdmin, deleteOrder);

module.exports = router;
