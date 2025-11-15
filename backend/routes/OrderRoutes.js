const express = require("express");
const router = express.Router();
const { getMyOrders } = require("../controllers/OrderController");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.get("/orders/me", isAuthenticatedUser, getMyOrders);

module.exports = router;
