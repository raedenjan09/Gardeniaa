import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as MUIDataTable from "mui-datatables";
import { Button, Box, FormControl, InputLabel, Select, MenuItem, Stack } from "@mui/material";
import Loader from "../../layouts/Loader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import StarIcon from "@mui/icons-material/Star";

const BASE_URL = "http://localhost:4001/api/v1";

export default function ReviewList() {
  const [reviews, setReviews] = useState([]);
  const [deletedReviews, setDeletedReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [productFilter, setProductFilter] = useState("");
  const [starFilter, setStarFilter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
    fetchDeletedReviews();
  }, [token]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      alert("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedReviews = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/reviews/deleted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletedReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Failed to fetch deleted reviews:", err);
    }
  };

  const displayedReviews = showDeleted ? deletedReviews : reviews;

  const productOptions = [...new Set(reviews.map((r) => r.productName).filter(Boolean))];

  const applyFilters = (productValue, starValue) => {
    let result = displayedReviews;
    if (productValue) result = result.filter((r) => r.productName === productValue);
    if (starValue) result = result.filter((r) => r.rating === starValue);
    setFilteredReviews(result);
  };

  useEffect(() => {
    applyFilters(productFilter, starFilter);
  }, [reviews, deletedReviews, showDeleted]);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setProductFilter(value);
    applyFilters(value, starFilter);
  };

  const handleStarFilterChange = (e) => {
    const value = parseInt(e.target.value);
    setStarFilter(value);
    applyFilters(productFilter, value);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return alert("No reviews selected.");
    if (!window.confirm(`Delete ${selectedIds.length} selected reviews?`)) return;

    try {
      if (showDeleted) {
        // Permanently delete
        await Promise.all(
          selectedIds.map(({ productId, reviewId }) =>
            axios.delete(`${BASE_URL}/admin/reviews/delete/${productId}/${reviewId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
        alert("Selected reviews permanently deleted!");
      } else {
        // Soft delete
        await Promise.all(
          selectedIds.map(({ productId, reviewId }) =>
            axios.delete(`${BASE_URL}/admin/reviews/softdelete/${productId}/${reviewId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
        alert("Selected reviews moved to trash!");
      }

      fetchReviews();
      fetchDeletedReviews();
      setSelectedIds([]);
    } catch (err) {
      console.error("Bulk delete failed:", err);
      alert("Failed to delete selected reviews.");
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Gardenia", 14, 15);
    doc.setFontSize(12);
    doc.text("Product Reviews", 14, 25);

    const tableColumn = ["Product", "User", "Rating", "Comment", "Date"];
    const tableRows = [];

    filteredReviews.forEach((rev) => {
      tableRows.push([
        rev.productName || "N/A",
        rev.user || "Anonymous",
        "★".repeat(rev.rating),
        rev.comment || "",
        new Date(rev.createdAt).toLocaleDateString(),
      ]);
    });

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30 });
    doc.save("Reviews.pdf");
  };

  const columns = [
    {
      name: "productName",
      label: "Product",
      options: {
        customBodyRenderLite: (dataIndex) => filteredReviews[dataIndex].productName || "N/A",
      },
    },
    {
      name: "user",
      label: "User",
      options: {
        customBodyRenderLite: (dataIndex) => filteredReviews[dataIndex].user || "Anonymous",
      },
    },
    {
      name: "rating",
      label: "Rating",
      options: {
        customBodyRenderLite: (dataIndex) => {
          const rating = filteredReviews[dataIndex].rating;
          return (
            <Box display="flex">
              {[...Array(rating)].map((_, i) => (
                <StarIcon key={i} style={{ color: "#FFD700" }} />
              ))}
            </Box>
          );
        },
      },
    },
    {
      name: "comment",
      label: "Comment",
      options: {
        customBodyRenderLite: (dataIndex) => filteredReviews[dataIndex].comment || "—",
      },
    },
    {
      name: "createdAt",
      label: "Date",
      options: {
        customBodyRenderLite: (dataIndex) =>
          new Date(filteredReviews[dataIndex].createdAt).toLocaleDateString(),
      },
    },
    {
      name: "actions",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const rev = filteredReviews[dataIndex];
          return (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() =>
                navigate(`/admin/reviews/view/${rev.productId}/${rev._id}`)
              }
            >
              View
            </Button>
          );
        },
      },
    },
  ];

  const options = {
    selectableRows: "multiple",
    selectableRowsOnClick: true,
    onRowSelectionChange: (currentRowsSelected, allRowsSelected, rowsSelectedIndexes) => {
      const selected = rowsSelectedIndexes.map((i) => ({
        productId: filteredReviews[i].productId,
        reviewId: filteredReviews[i]._id,
      }));
      setSelectedIds(selected);
    },
    download: false,
    print: false,
    viewColumns: false,
    filter: false,
    search: true,
    rowsPerPage: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
    elevation: 0,
    selectableRowsHideCheckboxes: false,
    customToolbarSelect: () => null,
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <Loader />
      </Box>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "24px auto", padding: 16 }}>
      <h2>Product Reviews</h2>

      <Stack direction="row" spacing={2} mb={2}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Product</InputLabel>
          <Select value={productFilter} label="Filter by Product" onChange={handleFilterChange}>
            <MenuItem value="">All Products</MenuItem>
            {productOptions.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Star</InputLabel>
          <Select value={starFilter} label="Filter by Star" onChange={handleStarFilterChange}>
            <MenuItem value={0}>All Stars</MenuItem>
            {[1, 2, 3, 4, 5].map((s) => (
              <MenuItem key={s} value={s}>
                {s} <StarIcon style={{ color: "#FFD700", verticalAlign: "middle" }} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" color="error" onClick={handleBulkDelete}>
          Delete Selected
        </Button>

        <Button variant="contained" color="primary" onClick={() => setShowDeleted(!showDeleted)}>
          {showDeleted ? "Show Active" : "Trash"}
        </Button>
      </Stack>

      <MUIDataTable.default data={filteredReviews} columns={columns} options={options} />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button variant="contained" color="secondary" onClick={exportPDF}>
          CSV
        </Button>
      </Box>
    </div>
  );
}
