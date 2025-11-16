// backend/controllers/CheckoutController.js
const Order = require("../models/OrderModels");
const User = require("../models/UserModels");
const Cart = require("../models/CartModels");
const Product = require("../models/ProductModels"); // Import product model
const { sendEmail } = require("../utils/Mailer");
const { generateOrderReceiptPDF } = require("../utils/PDFGenerator");

exports.checkout = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user
    const user = await User.findById(userId);
    if (!user) 
      return res.status(404).json({ success: false, message: "User not found" });

    // Fetch user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || !cart.items.length)
      return res.status(400).json({ success: false, message: "Cart is empty" });

    // Map user address to shippingInfo
    const shippingInfo = {
      address: `${user.address.street || ""}, ${user.address.barangay || ""}`,
      city: user.address.city || "",
      postalCode: user.address.zipcode || "",
      country: "Philippines",
      phoneNo: user.contact || "",
    };

    // Validate shipping info
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode || !shippingInfo.country || !shippingInfo.phoneNo) {
      return res.status(400).json({
        success: false,
        message: "Shipping address incomplete. Please update your profile with a valid address and contact number.",
      });
    }

    // Calculate totals
    const TAX_RATE = 0.1;
    const SHIPPING_PRICE = 50;

    const itemsPrice = cart.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    const taxPrice = itemsPrice * TAX_RATE;
    const totalPrice = itemsPrice + taxPrice + SHIPPING_PRICE;

    // Create order items
    const orderItems = cart.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.images?.[0]?.url || "",
      product: item.product._id,
    }));

    // Create order
    const order = await Order.create({
      user: userId,
      orderItems,
      shippingInfo,
      itemsPrice,
      taxPrice,
      shippingPrice: SHIPPING_PRICE,
      totalPrice,
      orderStatus: "Processing",
    });

    // Decrease stock for each product
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product) continue;

      // Reduce stock
      product.stock = Math.max(product.stock - item.quantity, 0);
      await product.save();
    }

    // Clear user's cart
    cart.items = [];
    await cart.save();

    // Send order confirmation email with PDF receipt
    try {
      const emailTemplate = createOrderConfirmationEmailTemplate(order, user);
      
      // Generate PDF receipt
      const pdfPath = await generateOrderReceiptPDF(order, user);
      
      await sendEmail({
        email: user.email,
        subject: `Order Confirmation - Order #${order._id}`,
        message: emailTemplate,
        attachments: [{
          filename: `Gardenia_Receipt_${order._id.toString().substring(0, 8)}.pdf`,
          path: pdfPath
        }]
      });
      console.log(`📧 Order confirmation email with PDF receipt sent to: ${user.email}`);
    } catch (emailError) {
      console.error("❌ Failed to send order confirmation email:", emailError.message);
      // Don't fail the checkout if email fails
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Email template for order confirmation
const createOrderConfirmationEmailTemplate = (order, user) => {
  const orderId = order._id.toString().substring(0, 8);
  const userName = user.name || 'Customer';
  const orderDate = new Date(order.createdAt).toLocaleString();
  const totalAmount = order.totalPrice.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });

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
        .order-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .item-list { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .item-list th, .item-list td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        .item-list th { background-color: #f2f2f2; }
        .total { font-weight: bold; color: #4CAF50; font-size: 18px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
        </div>
        
        <div class="content">
          <p>Dear ${userName},</p>
          <p>Thank you for your order! We're excited to let you know that we've received your order and it's being processed.</p>
          
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> #${orderId}</p>
            <p><strong>Order Date:</strong> ${orderDate}</p>
            <p><strong>Status:</strong> Processing</p>
            
            <h4>Order Items:</h4>
            <table class="item-list">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <p><strong>Subtotal:</strong> ${order.itemsPrice.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</p>
            <p><strong>Tax:</strong> ${order.taxPrice.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</p>
            <p><strong>Shipping:</strong> ${order.shippingPrice.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</p>
            <p class="total">Total: ${totalAmount}</p>
          </div>
          
          <p>We'll send you another email when your order status changes. You can also check your order status in your account dashboard.</p>
          
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

