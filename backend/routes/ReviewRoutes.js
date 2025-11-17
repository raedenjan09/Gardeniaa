const express = require("express");
const {
  createReview,
  updateReview,
  getProductReviews,
} = require("../controllers/ReviewController");
const { isAuthenticatedUser, isUser } = require("../middlewares/auth");

const router = express.Router();

// Create a new review
router.post("/review/create", isAuthenticatedUser, isUser, createReview);

// Update an existing review
router.put("/review/update", isAuthenticatedUser, isUser, updateReview);

// Get all reviews for a product
router.get("/reviews/:productId", getProductReviews);

module.exports = router;
