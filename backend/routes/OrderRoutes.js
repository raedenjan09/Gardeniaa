const express = require("express");
const router = express.Router();
const { getMyOrders, markOrderAsDelivered } = require("../controllers/OrderController");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.get("/orders/me", isAuthenticatedUser, getMyOrders);
router.patch("/orders/:orderId/delivered", isAuthenticatedUser, markOrderAsDelivered);

module.exports = router;
