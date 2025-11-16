import React, { useState, useEffect } from "react";
import apiClient from "../../config/axios";
import { Box, Typography, TextField, Button, Rating, CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { getUser } from "../utils/helper";

const Review = () => {
  const { productId } = useParams(); // Pass productId in route like /review/:productId
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch existing review if any
  useEffect(() => {
    const fetchReviews = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const { data } = await apiClient.get(`/reviews/${productId}`);
        const fetched = data.reviews || [];
        setReviews(fetched);

        const currentUser = getUser();
        const currentUserId = currentUser?.id || currentUser?._id;

        const existingReview = fetched.find((rev) => {
          // rev.user may be populated object or id string
          const userField = rev.user;
          if (!userField) return false;
          if (typeof userField === 'string') return userField === currentUserId;
          // populated object, try both _id and id
          return (userField._id && userField._id.toString() === currentUserId) || (userField.id && userField.id.toString() === currentUserId);
        });

        if (existingReview) {
          setRating(existingReview.rating);
          setComment(existingReview.comment);
          setIsEdit(true);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, token, navigate]);

  const handleSubmit = async () => {
    if (!rating || !comment) {
      alert("Please provide both rating and comment.");
      return;
    }

    setSubmitting(true);
    try {
      const url = isEdit ? "/review/update" : "/review/create";
      const method = isEdit ? "put" : "post";

      await apiClient[method](url, { productId, rating, comment });

      alert(isEdit ? "Review updated successfully!" : "Review submitted successfully!");

      // Refresh reviews
      const { data } = await apiClient.get(`/reviews/${productId}`);
      setReviews(data.reviews || []);

      setIsEdit(true);
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={3} maxWidth={800} mx="auto">
      <Typography variant="h4" mb={3}>
        Reviews
      </Typography>

      {/* Reviews list */}
      <Box mb={3}>
        {reviews.length === 0 ? (
          <Typography>No reviews yet. Be the first to review!</Typography>
        ) : (
          reviews.map((rev) => (
            <Box key={rev._id || rev.id} mb={2} p={2} borderRadius={2} boxShadow={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight={600}>{rev.name || rev.user?.name || 'User'}</Typography>
                <Rating value={Number(rev.rating)} readOnly />
              </Box>
              <Typography variant="body2" mt={1}>{rev.comment}</Typography>
              <Typography variant="caption" color="textSecondary">{new Date(rev.createdAt).toLocaleString()}</Typography>
            </Box>
          ))
        )}
      </Box>

      <Typography variant="h5" mb={2}>{isEdit ? "Edit Your Review" : "Write a Review"}</Typography>

      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="subtitle1" mr={2}>
          Rating:
        </Typography>
        <Rating
          value={rating}
          onChange={(e, newValue) => setRating(newValue)}
          precision={1}
        />
      </Box>

      <TextField
        label="Comment"
        multiline
        rows={4}
        fullWidth
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        margin="normal"
      />

      <Box mt={2} display="flex" gap={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : isEdit ? "Update Review" : "Submit Review"}
        </Button>
        <Button
          variant="outlined"
          onClick={() => { setRating(0); setComment(''); setIsEdit(false); }}
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
};

export default Review;
