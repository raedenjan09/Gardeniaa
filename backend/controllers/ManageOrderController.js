// backend/controllers/AdminOrderController.js
const Order = require("../models/OrderModels");
const User = require("../models/UserModels");
const { sendEmail } = require("../utils/Mailer");
const { generateOrderReceiptPDF } = require("../utils/PDFGenerator");

// 🟢 Get all orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
};

// 🟢 Get a single order by ID (Admin)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found." });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order details." });
  }
};

// 🟢 Update order status (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "Processing",
      "Accepted",
      "Cancelled",
      "Out for Delivery",
      "Delivered",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed: Processing, Accepted, Cancelled, Out For Delivery, Delivered.",
      });
    }

    const order = await Order.findById(id).populate("user", "name email");
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found." });

    const oldStatus = order.orderStatus;
    order.orderStatus = status;
    if (status === "Delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save();
    
    // Send email notification if status changed and user has email
    if (oldStatus !== status && order.user && order.user.email) {
      try {
        const emailTemplate = createOrderStatusEmailTemplate(order, status, oldStatus);
        const emailOptions = {
          email: order.user.email,
          subject: `Order Status Update - Order #${order._id}`,
          message: emailTemplate,
        };

        // Include PDF receipt when order is delivered
        if (status === "Delivered") {
          const pdfPath = await generateOrderReceiptPDF(order, order.user);
          emailOptions.attachments = [{
            filename: `Gardenia_Receipt_${order._id.toString().substring(0, 8)}.pdf`,
            path: pdfPath
          }];
        }

        await sendEmail(emailOptions);
        console.log(`📧 Order status email ${status === "Delivered" ? 'with PDF receipt ' : ''}sent to: ${order.user.email}`);
      } catch (emailError) {
        console.error("❌ Failed to send order status email:", emailError.message);
        // Don't fail the entire request if email fails
      }
    }

    res.status(200).json({ success: true, message: "Order status updated.", order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, message: "Failed to update order." });
  }
};

// Email template for order status updates
const createOrderStatusEmailTemplate = (order, newStatus, oldStatus) => {
  const orderId = order._id.toString().substring(0, 8);
  const userName = order.user.name || 'Customer';
  
  const statusMessages = {
    'Processing': 'Your order is now being processed by our team.',
    'Accepted': 'Your order has been accepted and is being prepared for shipping.',
    'Cancelled': 'Your order has been cancelled as requested.',
    'Out for Delivery': 'Great news! Your order is out for delivery and will arrive soon.',
    'Delivered': 'Your order has been successfully delivered. Thank you for shopping with us!'
  };

  const message = statusMessages[newStatus] || `Your order status has been updated to: ${newStatus}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 5px; }
        .order-info { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .status-update { color: #4CAF50; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Status Update</h1>
        </div>
        
        <div class="content">
          <p>Dear ${userName},</p>
          <p>We wanted to inform you about an update regarding your order:</p>
          
          <div class="order-info">
            <p><strong>Order ID:</strong> #${orderId}</p>
            <p><strong>Previous Status:</strong> ${oldStatus}</p>
            <p><strong>New Status:</strong> <span class="status-update">${newStatus}</span></p>
            <p><strong>Update Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>${message}</p>
          
          <p>If you have any questions about your order, please don't hesitate to contact our customer support team.</p>
          
          <p>Thank you for shopping with us!</p>
          <p><strong>The Gardenia Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© ${new Date().getFullYear()} Gardenia. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// 🟢 Delete order (Admin)
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found." });

    await order.deleteOne();
    res.status(200).json({ success: true, message: "Order deleted successfully." });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ success: false, message: "Failed to delete order." });
  }
};
