const express = require('express');
const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../controllers/CartController');

const { isAuthenticatedUser, isUser } = require('../middlewares/auth');

const router = express.Router();

// Cart routes
router.post('/cart/add', isAuthenticatedUser, isUser, addToCart); // Add product to cart
router.get('/cart', isAuthenticatedUser, isUser, getCart); // Get user's cart
router.patch('/cart/update', isAuthenticatedUser, isUser, updateCartItem); // Increase/decrease quantity
router.delete('/cart/remove/:productId', isAuthenticatedUser, isUser, removeCartItem); // Remove product from cart
router.delete('/cart/clear', isAuthenticatedUser, isUser, clearCart); // Clear entire cart
router.delete('/cart/remove-all', isAuthenticatedUser, isUser, clearCart); // Remove all items (alias)

module.exports = router;
