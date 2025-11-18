// Gardenia/frontend/src/Components/admin/ordermanagement/OrderList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import * as MUIDataTable from "mui-datatables";
import { Button, Stack, FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Loader from "../../layouts/Loader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BASE_URL = "http://localhost:4001/api/v1";

const statusOptions = ["Processing", "Accepted", "Cancelled", "Out for Delivery", "Delivered"];

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [displayedOrders, setDisplayedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingOrders, setUpdatingOrders] = useState({});
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];
    if (statusFilter) {
      filtered = filtered.filter((o) => o.orderStatus === statusFilter);
    }
    setDisplayedOrders(filtered);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    // Set loading state for this specific order
    setUpdatingOrders(prev => ({ ...prev, [orderId]: true }));
    
    try {
      await axios.put(
        `${BASE_URL}/admin/orders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );

      setDisplayedOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (err) {
      console.error("Failed to update order:", err);
    } finally {
      // Clear loading state
      setUpdatingOrders(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Gardenia", 14, 15);
    doc.setFontSize(12);
    doc.text("Order List", 14, 25);

    const tableColumn = ["Order ID", "User", "Product", "Total Price", "Status"];
    const tableRows = [];

    displayedOrders.forEach((order) => {
      const products = order.orderItems?.map((item) => `${item.quantity}x ${item.name}`).join(", ") || "N/A";
      tableRows.push([
        order._id,
        order.user?.name || "N/A",
        products,
        `₱${order.totalPrice?.toFixed(2) || "0.00"}`,
        order.orderStatus,
      ]);
    });

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30 });
    doc.save("OrderList.pdf");
  };

  const columns = [
    { name: "_id", label: "Order ID" },
    {
      name: "user",
      label: "User",
      options: {
        customBodyRenderLite: (dataIndex) => displayedOrders[dataIndex].user?.name || "N/A",
      },
    },
    {
      name: "products",
      label: "Product",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const order = displayedOrders[dataIndex];
          const products = order.orderItems?.map((item) => `${item.quantity}x ${item.name}`).join(", ");
          return products || "N/A";
        },
      },
    },
    {
      name: "totalPrice",
      label: "Total Price",
      options: {
        customBodyRenderLite: (dataIndex) =>
          `₱${displayedOrders[dataIndex].totalPrice?.toFixed(2) || "0.00"}`,
      },
    },
    {
      name: "orderStatus",
      label: "Status",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const order = displayedOrders[dataIndex];
          const isUpdating = updatingOrders[order._id];
          
          return (
            <FormControl size="small" fullWidth>
              <Select
                value={order.orderStatus}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                disabled={isUpdating}
                displayEmpty
                renderValue={(selected) => (
                  isUpdating ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #f3f3f3',
                        borderTop: '2px solid #4CAF50',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    selected
                  )
                )}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        },
      },
    },
    {
      name: "actions",
      label: "Action",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => (
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={() => navigate(`/admin/orders/view/${displayedOrders[dataIndex]._id}`)}
          >
            View
          </Button>
        ),
      },
    },
  ];

  const options = {
    selectableRows: "none", // ✅ remove checkboxes
    download: false,
    print: false,
    viewColumns: false,
    filter: false,
    search: true,
    rowsPerPage: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
    elevation: 0,
    responsive: "standard",
  };

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Loader />
      </div>
    );

  return (
    <div style={{ maxWidth: 1200, margin: "24px auto", padding: 16 }}>
      <h2>Order Management</h2>

      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <MUIDataTable.default data={displayedOrders} columns={columns} options={options} />

      <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
        <Button variant="contained" color="secondary" onClick={exportPDF}>
          CSV
        </Button>
      </Box>
    </div>
  );

  // Add CSS for spinner animation
  const spinnerStyle = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{spinnerStyle}</style>
      <div style={{ maxWidth: 1200, margin: "24px auto", padding: 16 }}>
        <h2>Order Management</h2>

        <Stack direction="row" spacing={2} mb={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <MUIDataTable.default data={displayedOrders} columns={columns} options={options} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
          <Button variant="contained" color="secondary" onClick={exportPDF}>
            CSV
          </Button>
        </Box>
      </div>
    </>
  );
}
