import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Header.css';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HistoryIcon from '@mui/icons-material/History';

const Header = () => {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
      fetchCartItemsCount(token);
    } else {
      setUser(null); // Clear user if no token
      setCartItemsCount(0);
    }

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      const token = localStorage.getItem('token');
      if (token) {
        fetchCartItemsCount(token);
      }
    };

    // Add event listener for cart updates
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [location.pathname]); // Re-run when route changes (e.g., after login)

  const fetchUserProfile = async (token) => {
    try {
      const { data } = await axios.get('http://localhost:4001/api/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Clear invalid token
      localStorage.removeItem('token');
    }
  };

  const fetchCartItemsCount = async (token) => {
    try {
      const { data } = await axios.get('http://localhost:4001/api/v1/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const totalItems = data.cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartItemsCount(totalItems);
    } catch (error) {
      console.error('Error fetching cart items count:', error);
      setCartItemsCount(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCartItemsCount(0);
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const isAdmin = user?.role === 'admin';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <Link to={isAdmin ? "/admin" : "/"}>
            <span className="logo-text">GARDENIA</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          {isAdmin ? (
            // Admin Navigation
            <div className="nav-links">
              <Link 
                to="/admin" 
                className={`nav-link ${isActiveRoute('/admin') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/admin/products" 
                className={`nav-link ${isActiveRoute('/admin/products') ? 'active' : ''}`}
              >
                Products
              </Link>
              <Link 
                to="/admin/suppliers" 
                className={`nav-link ${isActiveRoute('/admin/suppliers') ? 'active' : ''}`}
              >
                Suppliers
              </Link>
              <Link 
                to="/admin/users" 
                className={`nav-link ${isActiveRoute('/admin/users') ? 'active' : ''}`}
              >
                Users
              </Link>
              <Link 
                to="/admin/orders" 
                className={`nav-link ${isActiveRoute('/admin/orders') ? 'active' : ''}`}
              >
                Orders
              </Link>
              <Link 
                to="/admin/reviews" 
                className={`nav-link ${isActiveRoute('/admin/reviews') ? 'active' : ''}`}
              >
                Reviews
              </Link>
            </div>
          ) : (
            // User Navigation
            <div className="nav-links">
              <Link
                to="/"
                className={`nav-link ${isActiveRoute('/') ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link
                to="/products"
                className={`nav-link ${isActiveRoute('/products') ? 'active' : ''}`}
              >
                Products
              </Link>
            </div>
          )}
        </nav>

        {/* Search Field */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search products..."
            className="search-input"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyPress={handleKeyPress}
          />
          <button className="search-btn" onClick={handleSearch}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </button>
        </div>

        {/* User Actions */}
        <div className="user-actions">
          {user ? (
            <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {!isAdmin && (
                <>
                  <div className="cart-icon-wrapper" style={{ position: 'relative' }}>
                    <Link
                      to="/cart"
                      className={`icon-link ${isActiveRoute('/cart') ? 'active' : ''}`}
                      title="Shopping Cart"
                    >
                      <ShoppingCartIcon />
                    </Link>
                    {cartItemsCount > 0 && (
                      <span className="cart-badge">{cartItemsCount}</span>
                    )}
                  </div>
                  <Link
                    to="/order-history"
                    className={`icon-link ${isActiveRoute('/order-history') ? 'active' : ''}`}
                    title="Order History"
                  >
                    <HistoryIcon />
                  </Link>
                </>
              )}
              <div 
                className="user-avatar"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <img 
                  src={user.avatar?.url || '/images/default-avatar.png'} 
                  alt={user.name}
                  className="avatar-image"
                />
                <span className="user-name">{user.name.split(' ')[0]}</span>
                <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
              </div>
              
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <Link 
                    to={isAdmin ? "/admin/profile" : "/profile"} 
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="nav-mobile">
          {/* Mobile Search */}
          <div className="mobile-search-container">
            <input
              type="text"
              placeholder="Search products..."
              className="mobile-search-input"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyPress={handleKeyPress}
            />
            <button className="mobile-search-btn" onClick={handleSearch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </button>
          </div>

          {isAdmin ? (
            <div className="mobile-nav-links">
              <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
              <Link to="/admin/products" onClick={() => setIsMobileMenuOpen(false)}>Products</Link>
              <Link to="/admin/suppliers" onClick={() => setIsMobileMenuOpen(false)}>Suppliers</Link>
              <Link to="/admin/users" onClick={() => setIsMobileMenuOpen(false)}>Users</Link>
              <Link to="/admin/orders" onClick={() => setIsMobileMenuOpen(false)}>Orders</Link>
              <Link to="/admin/reviews" onClick={() => setIsMobileMenuOpen(false)}>Reviews</Link>
            </div>
          ) : (
            <div className="mobile-nav-links">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>Products</Link>
              {user && !isAdmin && (
                <>
                  <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)}>Cart</Link>
                  <Link to="/order-history" onClick={() => setIsMobileMenuOpen(false)}>Orders</Link>
                </>
              )}
            </div>
          )}
          
          {user ? (
            <div className="mobile-user-actions">
              <Link to={isAdmin ? "/admin/profile" : "/profile"} onClick={() => setIsMobileMenuOpen(false)}>
                Profile
              </Link>
              <button onClick={handleLogout} className="logout-btn-mobile">Logout</button>
            </div>
          ) : (
            <div className="mobile-auth-buttons">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}

      {/* Overlay for dropdown and mobile menu */}
      {(isDropdownOpen || isMobileMenuOpen) && (
        <div 
          className="overlay"
          onClick={() => {
            setIsDropdownOpen(false);
            setIsMobileMenuOpen(false);
          }}
        ></div>
      )}
    </header>
  );
};

export default Header;