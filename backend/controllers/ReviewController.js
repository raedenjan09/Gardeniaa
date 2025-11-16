const Product = require("../models/ProductModels");
const Filter = require('bad-words');

// Initialize filter with default bad words
const filter = new Filter();

// Add custom bad words specific to your application
const customBadWords = [
  'garbage',
  'worthless',
  'horrible',
  'waste',
  'scam',
  'fraud',
  'fake',
  'defective',
  'broken',
  'stolen',
  'tanga',
  'bulok',
  'basura',
  'sira',
  'gago',
];

// Add each custom word to the filter
customBadWords.forEach(word => {
  filter.addWords(word);
});

// Optional: Set custom replacement character (default is *)
// filter.setPlaceHolder('*');  // or use other characters like '#', '&', etc.

// Create a review (only if the user hasn't reviewed yet)
exports.createReview = async (req, res) => {
  try {
    const { rating, comment, productId } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    if (rating === undefined || rating === null || !comment || !productId) {
      return res.status(400).json({ success: false, message: "Please provide rating, comment, and productId." });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    // Check if user already reviewed
    const existingReview = product.reviews.find(
      (rev) => rev.user.toString() === userId.toString()
    );

    if (existingReview) {
      return res.status(400).json({ success: false, message: "You have already reviewed this product. Please update your review instead." });
    }

    // Clean comment for profanity before saving
    const cleanComment = filter.clean(comment);
    
    // Log for verification - remove in production
    if (comment !== cleanComment) {
      console.log(`🚫 PROFANITY FILTERED:`);
      console.log(`   Original: "${comment}"`);
      console.log(`   Filtered: "${cleanComment}"`);
    }

    // Add new review
    product.reviews.push({
      user: userId,
      name: userName,
      rating: Number(rating),
      comment: cleanComment,
    });

    product.numOfReviews = product.reviews.length;
    product.ratings =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({ success: true, message: "Review created successfully." });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update an existing review
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment, productId } = req.body;
    const userId = req.user._id;

    if (rating === undefined || rating === null || !comment || !productId) {
      return res.status(400).json({ success: false, message: "Please provide rating, comment, and productId." });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    const reviewIndex = product.reviews.findIndex(
      (rev) => rev.user.toString() === userId.toString()
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ success: false, message: "Review not found. Please create a review first." });
    }

    // Clean comment for profanity before updating
    const cleanComment = filter.clean(comment);
    
    // Log for verification - remove in production
    if (comment !== cleanComment) {
      console.log(`🚫 PROFANITY FILTERED (UPDATE):`);
      console.log(`   Original: "${comment}"`);
      console.log(`   Filtered: "${cleanComment}"`);
    }

    product.reviews[reviewIndex].rating = Number(rating);
    product.reviews[reviewIndex].comment = cleanComment;
    product.reviews[reviewIndex].createdAt = new Date();

    // Update average rating
    product.ratings =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) /
      product.reviews.length;

    await product.save();

    res.status(200).json({ success: true, message: "Review updated successfully." });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const productId = req.params.productId || req.query.productId;
    const product = await Product.findById(productId).populate("reviews.user", "name email");
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    // Return only active reviews by default
    const activeReviews = product.reviews.filter(r => r.isActive !== false);

    res.status(200).json({ success: true, reviews: activeReviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
