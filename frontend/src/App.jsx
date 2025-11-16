import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./Components/layouts/Header";
import Footer from "./Components/layouts/user/Footer";
import FallingLeaves from "./Components/layouts/FallingLeaves";
import Login from "./Components/user/Login";
import Register from "./Components/user/Register";
import Profile from "./Components/user/Profile";
import UpdateProfile from "./Components/user/UpdateProfile";
import ForgotPassword from "./Components/user/ForgotPassword";
import ResetPassword from "./Components/user/ResetPassword";
import Home from "./Components/user/Home";
import Cart from "./Components/user/Cart";
import OrderHistory from "./Components/user/OrderHistory";
import Review from "./Components/user/Review";
import CheckoutConfirmation from "./Components/user/CheckoutConfirmation";
import ProductDetail from "./Components/user/ProductDetail";
import AdminDashboard from "./Components/Admin/AdminDashboard";
import AdminRoutes from "./Components/Admin/AdminRoutes";
import { getUser } from "./Components/utils/helper";

// Product Management
import ProductList from "./Components/Admin/productmanagement/ProductList";
import CreateProduct from "./Components/Admin/productmanagement/CreateProduct";
import UpdateProduct from "./Components/Admin/productmanagement/UpdateProduct";
import ViewProduct from "./Components/Admin/productmanagement/ViewProduct";

// Supplier Management
import SupplierList from "./Components/Admin/suppliermanagement/SupplierList";
import CreateSupplier from "./Components/Admin/suppliermanagement/CreateSupplier";
import UpdateSupplier from "./Components/Admin/suppliermanagement/UpdateSupplier";
import ViewSupplier from "./Components/Admin/suppliermanagement/ViewSupplier";

// User Management
import UserList from "./Components/Admin/usermanagement/UserList";
import CreateUser from "./Components/Admin/usermanagement/CreateUser";
import ViewUser from "./Components/Admin/usermanagement/ViewUser";

// Order Management
import OrderList from "./Components/Admin/ordermanagement/OrderList";
import ViewOrder from "./Components/Admin/ordermanagement/ViewOrder";

// Review Management (NEW)
import ReviewList from "./Components/Admin/reviewmanagement/ReviewList";
import AdminProfile from "./Components/Admin/AdminProfile";

// Layout component that includes the header (for user routes)
const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <FallingLeaves />
      <Header />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

const App = () => {
  const token = localStorage.getItem("token");
  const user = getUser();

  const getDefaultRoute = () => {
    if (!token) return "/login";
    if (user && user.role === "admin") return "/admin/dashboard";
    return "/home";
  };

  return (
    <Router>
      <Routes>
        {/* Default Route */}
        <Route path="/" element={<Navigate to={getDefaultRoute()} />} />

        {/* Public Routes (without header) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* User Protected Routes (with header) */}
        <Route path="/home" element={token ? <Layout><Home /></Layout> : <Navigate to="/login" />} />
        <Route path="/products" element={token ? <Layout><Home /></Layout> : <Navigate to="/login" />} />
        <Route path="/product/:productId" element={token ? <Layout><ProductDetail /></Layout> : <Navigate to="/login" />} />
        <Route path="/checkout/solo/:productId" element={token ? <Layout><CheckoutConfirmation /></Layout> : <Navigate to="/login" />} />
        <Route path="/profile" element={token ? <Layout><Profile /></Layout> : <Navigate to="/login" />} />
        <Route path="/update-profile" element={token ? <Layout><UpdateProfile /></Layout> : <Navigate to="/login" />} />
        <Route path="/cart" element={token ? <Layout><Cart /></Layout> : <Navigate to="/login" />} />
        <Route path="/checkout-confirmation" element={token ? <Layout><CheckoutConfirmation /></Layout> : <Navigate to="/login" />} />
        <Route path="/order-history" element={token ? <Layout><OrderHistory /></Layout> : <Navigate to="/login" />} /> 
        <Route path="/review/:productId" element={token ? <Layout><Review /></Layout> : <Navigate to="/login" />} />

        {/* Admin Routes (with sidebar layout) */}
        <Route path="/admin/dashboard" element={<AdminRoutes><AdminDashboard /></AdminRoutes>} />

        {/* Product Management */}
        <Route path="/admin/products" element={<AdminRoutes><ProductList /></AdminRoutes>} />
        <Route path="/admin/products/new" element={<AdminRoutes><CreateProduct /></AdminRoutes>} />
        <Route path="/admin/products/edit/:id" element={<AdminRoutes><UpdateProduct /></AdminRoutes>} />
        <Route path="/admin/products/view/:id" element={<AdminRoutes><ViewProduct /></AdminRoutes>} />

        {/* Supplier Management */}
        <Route path="/admin/suppliers" element={<AdminRoutes><SupplierList /></AdminRoutes>} />
        <Route path="/admin/suppliers/new" element={<AdminRoutes><CreateSupplier /></AdminRoutes>} />
        <Route path="/admin/suppliers/edit/:id" element={<AdminRoutes><UpdateSupplier /></AdminRoutes>} />
        <Route path="/admin/suppliers/view/:id" element={<AdminRoutes><ViewSupplier /></AdminRoutes>} />

        {/* User Management */}
        <Route path="/admin/users" element={<AdminRoutes><UserList /></AdminRoutes>} />
        <Route path="/admin/users/create" element={<AdminRoutes><CreateUser /></AdminRoutes>} />
        <Route path="/admin/users/view/:id" element={<AdminRoutes><ViewUser /></AdminRoutes>} />

        {/* Order Management */}
        <Route path="/admin/orders" element={<AdminRoutes><OrderList /></AdminRoutes>} />
        <Route path="/admin/orders/view/:orderId" element={<AdminRoutes><ViewOrder /></AdminRoutes>} />

        {/* Review Management (NEW) */}
        <Route path="/admin/reviews" element={<AdminRoutes><ReviewList /></AdminRoutes>} />

        {/* Admin Profile */}
        <Route path="/admin/profile" element={<AdminRoutes><AdminProfile /></AdminRoutes>} />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
      </Routes>
    </Router>
  );
};

export default App;
