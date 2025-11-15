import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../utils/helper';
import './AdminSidebar.css';

const AdminSidebar = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(() => navigate('/login'));
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Products', icon: '🌿' },
    { path: '/admin/suppliers', label: 'Suppliers', icon: '🏭' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/orders', label: 'Orders', icon: '📦' },
    { path: '/admin/reviews', label: 'Reviews', icon: '⭐' }
  ];

  return (
    <div className="admin-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <Link to="/admin/dashboard" className="logo-link">
          <img src="/images/logo.png" alt="Gardenia Logo" className="logo-image" />
          <span class="logo-text">Gardenia</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="sidebar-user-info">
        <div className="user-avatar">
          <img 
            src={user?.avatar?.url || '/images/default-avatar.png'} 
            alt={user?.name}
            className="avatar-image"
          />
        </div>
        <div className="user-details">
          <h4 className="user-name">{user?.name}</h4>
          <p className="user-email">{user?.email}</p>
          <span className="user-role">{user?.role}</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${isActiveRoute(item.path) ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <span className="logout-icon">🚪</span>
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;