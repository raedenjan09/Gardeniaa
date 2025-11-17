const express = require("express");
const router = express.Router();
const { getMyOrders, markOrderAsDelivered } = require("../controllers/OrderController");
const { isAuthenticatedUser, isUser } = require("../middlewares/auth");

router.get("/orders/me", isAuthenticatedUser, isUser, getMyOrders);
router.patch("/orders/:orderId/delivered", isAuthenticatedUser, isUser, markOrderAsDelivered);

module.exports = router;
