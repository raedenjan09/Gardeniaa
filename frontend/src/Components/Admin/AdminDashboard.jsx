import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { getUser, logout } from "../utils/helper";
import Loader from "../layouts/Loader"; // ✅ import Loader

const AdminDashboard = () => {
  const user = getUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    products: 0,
    suppliers: 0,
    users: 0,
    orders: 0, // added orders
    reviews: 0, // added reviews
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:4001/api/v1";

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [productsRes, suppliersRes, usersRes, ordersRes, reviewsRes] =
        await Promise.all([
          axios.get(`${API_BASE}/products`, config),
          axios.get(`${API_BASE}/suppliers`, config),
          axios.get(`${API_BASE}/users`, config),
          axios.get(`${API_BASE}/admin/orders`, config),
          axios.get(`${API_BASE}/admin/reviews`, config), // fetch reviews
        ]);

      const products = productsRes.data.products || productsRes.data || [];
      const suppliers = suppliersRes.data.suppliers || suppliersRes.data || [];
      const users = usersRes.data.users || [];
      const orders = ordersRes.data.orders || [];
      const reviews = reviewsRes.data.reviews || [];

      setStats({
        products: products.length,
        suppliers: suppliers.length,
        users: users.length,
        orders: orders.length,
        reviews: reviews.length, // set reviews count
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout(() => navigate("/login"));
  };

  if (loading)
    return (
      <div className="loader-container">
        <Loader />
      </div>
    );

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1>Admin Dashboard</h1>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-number">{stats.products}</p>
          <Link to="/admin/products" className="stat-link">
            Manage Products
          </Link>
        </div>

        <div className="stat-card">
          <h3>Total Suppliers</h3>
          <p className="stat-number">{stats.suppliers}</p>
          <Link to="/admin/suppliers" className="stat-link">
            Manage Suppliers
          </Link>
        </div>

        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.users}</p>
          <Link to="/admin/users" className="stat-link">
            Manage Users
          </Link>
        </div>

        {/* Orders */}
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-number">{stats.orders}</p>
          <Link to="/admin/orders" className="stat-link">
            Manage Orders
          </Link>
        </div>

        {/* Reviews */}
        <div className="stat-card">
          <h3>Total Reviews</h3>
          <p className="stat-number">{stats.reviews}</p>
          <Link to="/admin/reviews" className="stat-link">
            Manage Reviews
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
