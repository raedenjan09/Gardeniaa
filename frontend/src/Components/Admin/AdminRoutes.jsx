// src/Components/admin/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUser } from '../utils/helper';
import AdminLayout from './AdminLayout';

const AdminRoutes = ({ children }) => {
  const user = getUser();
  
  // Check if user exists and is an admin
  const isAdmin = user && user.role === 'admin';
  
  return isAdmin ? <AdminLayout>{children}</AdminLayout> : <Navigate to="/login" replace />;
};

export default AdminRoutes;