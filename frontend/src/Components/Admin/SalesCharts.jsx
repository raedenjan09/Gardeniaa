import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box, Button, TextField, Typography, CircularProgress, Stack } from "@mui/material";
import "./SalesCharts.css";

const SalesCharts = () => {
  const [monthlySalesData, setMonthlySalesData] = useState([]);
  const [filteredSalesData, setFilteredSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("line"); // 'line' or 'bar'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const token = localStorage.getItem("token");
  const API_BASE = "http://localhost:4001/api/v1";

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch all orders
      const { data } = await axios.get(`${API_BASE}/admin/orders`, config);
      const orders = data.orders || [];

      // Aggregate by month
      const monthlyMap = {};
      const dateMap = {};

      orders.forEach((order) => {
        // Only count delivered or completed orders
        if (order.orderStatus === "Delivered" || order.orderStatus === "Accepted") {
          const date = new Date(order.createdAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`; // YYYY-MM
          const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

          // Monthly aggregation
          if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = { month: monthKey, sales: 0, orders: 0 };
          }
          monthlyMap[monthKey].sales += order.totalPrice || 0;
          monthlyMap[monthKey].orders += 1;

          // Date aggregation
          if (!dateMap[dateKey]) {
            dateMap[dateKey] = { date: dateKey, sales: 0, orders: 0 };
          }
          dateMap[dateKey].sales += order.totalPrice || 0;
          dateMap[dateKey].orders += 1;
        }
      });

      // Convert to sorted arrays
      const monthlySorted = Object.values(monthlyMap)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((item) => ({
          ...item,
          displayMonth: formatMonthLabel(item.month),
        }));

      const dateSorted = Object.values(dateMap).sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      setMonthlySalesData(monthlySorted);
      setFilteredSalesData(dateSorted);
    } catch (error) {
      console.error("Failed to fetch sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split("-");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const handleDateFilter = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      alert("Start date must be before end date");
      return;
    }

    const filtered = Object.values(filteredSalesData).filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= start && itemDate <= end;
    });

    setFilteredSalesData(filtered);
  };

  const handleClearFilter = () => {
    fetchSalesData();
    setStartDate("");
    setEndDate("");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3} sx={{ backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
      <Typography variant="h5" mb={3} fontWeight="bold">
        Sales Analytics
      </Typography>

      {/* Chart Type Selector */}
      <Box mb={3} display="flex" gap={2} alignItems="center">
        <Typography variant="body2">Chart Type:</Typography>
        <Button
          variant={chartType === "line" ? "contained" : "outlined"}
          color="primary"
          onClick={() => setChartType("line")}
          size="small"
        >
          Line Chart
        </Button>
        <Button
          variant={chartType === "bar" ? "contained" : "outlined"}
          color="primary"
          onClick={() => setChartType("bar")}
          size="small"
        >
          Bar Chart
        </Button>
      </Box>

      {/* Monthly Sales Chart */}
      <Box
        mb={4}
        p={2}
        sx={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h6" mb={2} fontWeight="bold">
          Monthly Sales
        </Typography>
        {monthlySalesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            {chartType === "line" ? (
              <LineChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="displayMonth"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis label={{ value: "Sales ($)", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  formatter={(value) => `$${value.toFixed(2)}`}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ fill: "#8884d8", r: 5 }}
                  activeDot={{ r: 8 }}
                  name="Sales"
                />
              </LineChart>
            ) : (
              <BarChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="displayMonth"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis label={{ value: "Sales ($)", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  formatter={(value) => `$${value.toFixed(2)}`}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Bar dataKey="sales" fill="#82ca9d" name="Sales" />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <Typography color="textSecondary">No monthly sales data available.</Typography>
        )}
      </Box>

      {/* Date Range Filter */}
      <Box
        p={2}
        sx={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h6" mb={2} fontWeight="bold">
          Sales by Date Range
        </Typography>

        {/* Filter Controls */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
          <TextField
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleDateFilter}
            sx={{ height: "40px" }}
          >
            Filter
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearFilter}
            sx={{ height: "40px" }}
          >
            Clear
          </Button>
        </Stack>

        {/* Date Range Chart */}
        {filteredSalesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            {chartType === "line" ? (
              <LineChart data={filteredSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  interval={Math.floor(filteredSalesData.length / 10) || 0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis label={{ value: "Sales ($)", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  formatter={(value) => `$${value.toFixed(2)}`}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#ffc658"
                  strokeWidth={2}
                  dot={false}
                  name="Daily Sales"
                />
              </LineChart>
            ) : (
              <BarChart data={filteredSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  interval={Math.floor(filteredSalesData.length / 10) || 0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis label={{ value: "Sales ($)", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  formatter={(value) => `$${value.toFixed(2)}`}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Bar dataKey="sales" fill="#ff7c7c" name="Daily Sales" />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <Typography color="textSecondary">
            {startDate && endDate ? "No sales data in the selected date range." : "Select a date range to view sales."}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SalesCharts;
