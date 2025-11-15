const express = require('express');
const { checkout} = require('../controllers/CheckoutController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

// Checkout endpoint
router.post('/checkout', isAuthenticatedUser, checkout);


module.exports = router;
