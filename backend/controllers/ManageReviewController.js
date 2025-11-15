const Product = require("../models/ProductModels");

// ✅ Get all active reviews from all products
exports.getAllReviews = async (req, res) => {
  try {
    const products = await Product.find();

    const allReviews = products.flatMap((product) =>
      product.reviews
        .filter((review) => review.isActive !== false) // only active reviews
        .map((review) => ({
          _id: review._id,
          productId: product._id,
          productName: product.name,
          user: review.name || "Deleted User",
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        }))
    );

    res.status(200).json({ success: true, reviews: allReviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

// ✅ Soft delete a review by review ID and product ID
exports.softDeleteReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    review.isActive = false;

    await product.save();

    res.status(200).json({ success: true, message: "Review soft-deleted successfully" });
  } catch (error) {
    console.error("Error soft deleting review:", error);
    res.status(500).json({ success: false, message: "Failed to soft delete review" });
  }
};

// ✅ Restore a soft-deleted review
exports.restoreReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    review.isActive = true;

    await product.save();

    res.status(200).json({ success: true, message: "Review restored successfully" });
  } catch (error) {
    console.error("Error restoring review:", error);
    res.status(500).json({ success: false, message: "Failed to restore review" });
  }
};

// ✅ Get all soft-deleted reviews
exports.getDeletedReviews = async (req, res) => {
  try {
    const products = await Product.find();

    const deletedReviews = products.flatMap((product) =>
      product.reviews
        .filter((review) => review.isActive === false) // only deleted reviews
        .map((review) => ({
          _id: review._id,
          productId: product._id,
          productName: product.name,
          user: review.name || "Deleted User",
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        }))
    );

    res.status(200).json({
      success: true,
      count: deletedReviews.length,
      reviews: deletedReviews,
    });
  } catch (error) {
    console.error("Error fetching deleted reviews:", error);
    res.status(500).json({ success: false, message: "Failed to fetch deleted reviews" });
  }
};


exports.deleteReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Remove the review manually from the array
    const reviewIndex = product.reviews.findIndex(
      (r) => r._id.toString() === reviewId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Permanently delete it
    product.reviews.splice(reviewIndex, 1);

    // Save the updated product
    await product.save();

    res.status(200).json({ success: true, message: "Review permanently deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ success: false, message: "Failed to delete review" });
  }
};
