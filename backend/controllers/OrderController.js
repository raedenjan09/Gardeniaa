const Order = require("../models/OrderModels");

// Get all orders for the logged-in user
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Allow user to mark their order as Delivered/Claimed
exports.markOrderAsDelivered = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check if the order belongs to the user
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: This is not your order" });
    }

    // Only allow marking as Delivered if current status is not already Delivered or Cancelled
    if (order.orderStatus === "Delivered" || order.orderStatus === "Cancelled") {
      return res.status(400).json({ success: false, message: `Order is already ${order.orderStatus}` });
    }

    order.orderStatus = "Delivered";
    order.deliveredAt = new Date();

    await order.save();

    res.status(200).json({ success: true, message: "Order marked as Delivered", order });
  } catch (error) {
    console.error("Mark order as delivered error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
