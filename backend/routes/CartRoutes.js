const express = require('express');
const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../controllers/CartController');

const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

// Cart routes
router.post('/cart/add', isAuthenticatedUser, addToCart); // Add product to cart
router.get('/cart', isAuthenticatedUser, getCart); // Get user's cart
router.patch('/cart/update', isAuthenticatedUser, updateCartItem); // Increase/decrease quantity
router.delete('/cart/remove/:productId', isAuthenticatedUser, removeCartItem); // Remove product from cart
router.delete('/cart/clear', isAuthenticatedUser, clearCart); // Clear entire cart
router.delete('/cart/remove-all', isAuthenticatedUser, clearCart); // Remove all items (alias)

module.exports = router;
