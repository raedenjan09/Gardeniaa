import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button, Rating, CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

const Review = () => {
  const { productId } = useParams(); // Pass productId in route like /review/:productId
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch existing review if any
  useEffect(() => {
    const fetchReview = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const { data } = await axios.get(`http://localhost:4001/api/v1/reviews?productId=${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const existingReview = data.reviews.find(
          (rev) => rev.user._id === JSON.parse(atob(token.split(".")[1])).id
        );

        if (existingReview) {
          setRating(existingReview.rating);
          setComment(existingReview.comment);
          setIsEdit(true);
        }
      } catch (error) {
        console.error("Failed to fetch review:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [productId, token, navigate]);

  const handleSubmit = async () => {
    if (!rating || !comment) {
      alert("Please provide both rating and comment.");
      return;
    }

    setSubmitting(true);
    try {
      const url = isEdit
        ? "http://localhost:4001/api/v1/review/update"
        : "http://localhost:4001/api/v1/review/create";

      const method = isEdit ? "put" : "post";

      await axios[method](
        url,
        { productId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(isEdit ? "Review updated successfully!" : "Review submitted successfully!");
      navigate("/home"); // Redirect back to home or product page
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
    <Box p={3} maxWidth={600} mx="auto">
      <Typography variant="h4" mb={3}>
        {isEdit ? "Edit Your Review" : "Write a Review"}
      </Typography>

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

      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : isEdit ? "Update Review" : "Submit Review"}
        </Button>
      </Box>
    </Box>
  );
};

export default Review;
