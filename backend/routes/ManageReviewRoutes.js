const express = require("express");
const router = express.Router();

const {
  getAllReviews,
  getDeletedReviews,
  softDeleteReview,
  restoreReview,
  deleteReview,
} = require("../controllers/ManageReviewController");

const { isAuthenticatedUser, isAdmin } = require("../middlewares/auth");


router.get("/admin/reviews", isAuthenticatedUser, isAdmin, getAllReviews);
router.get("/admin/reviews/deleted", isAuthenticatedUser, isAdmin, getDeletedReviews);
router.delete("/admin/reviews/softdelete/:productId/:reviewId", isAuthenticatedUser, isAdmin, softDeleteReview);
router.patch("/admin/reviews/restore/:productId/:reviewId", isAuthenticatedUser, isAdmin, restoreReview);
router.delete("/admin/reviews/delete/:productId/:reviewId", isAuthenticatedUser, isAdmin, deleteReview);
module.exports = router;
