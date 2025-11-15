import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Loader from "../layouts/Loader";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HistoryIcon from "@mui/icons-material/History";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";

const Home = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          const { data } = await axios.get("http://localhost:4001/api/v1/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(data.user);

          const cartRes = await axios.get("http://localhost:4001/api/v1/cart", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCartCount(cartRes.data.cart?.items?.length || 0);
        }

        // Check for search query in URL
        const searchParams = new URLSearchParams(location.search);
        const searchQuery = searchParams.get('search');
        
        let productsRes;
        if (searchQuery) {
          productsRes = await axios.get(`http://localhost:4001/api/v1/products/search?q=${encodeURIComponent(searchQuery)}`);
        } else {
          productsRes = await axios.get("http://localhost:4001/api/v1/products");
        }
        
        const productsData = productsRes.data.products || productsRes.data || [];
        setProducts(productsData);

        const initialIndexes = {};
        productsData.forEach((product) => {
          if (product.images && product.images.length > 0) {
            initialIndexes[product._id] = 0;
          }
        });
        setCurrentImageIndexes(initialIndexes);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchData();
  }, [token, location.search]);

  const nextImage = (productId, totalImages, e) => {
    e.stopPropagation();
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [productId]: (prev[productId] + 1) % totalImages,
    }));
  };

  const prevImage = (productId, totalImages, e) => {
    e.stopPropagation();
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [productId]: (prev[productId] - 1 + totalImages) % totalImages,
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndexes((prev) => {
        const newIndexes = { ...prev };
        products.forEach((product) => {
          if (product.images && product.images.length > 1) {
            newIndexes[product._id] = (prev[product._id] + 1) % product.images.length;
          }
        });
        return newIndexes;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [products]);

  // Slideshow auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = async (productId) => {
    if (!token) {
      alert("Please log in to add products to your cart.");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:4001/api/v1/cart/add",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartCount(res.data.cart.items.length);
      alert("Product added to cart!");
    } catch (error) {
      console.error("Failed to add product to cart", error);
      alert(error.response?.data?.message || "Failed to add product to cart.");
    }
  };

  const handleCheckoutSolo = (productId) => {
    navigate(`/checkout/solo/${productId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="home-container">
      {user && (
        <>
          {/* Farm Tools & Plants Banner Slideshow */}
          <div className="slideshow-container">
            <div className={currentSlide === 0 ? "slide active" : "slide"}>
              <img src="/images/banner1.jpg" alt="Farm Tools Collection" className="slide-image" />
              <div className="slide-content">
                <h2 className="slide-title">Premium Farm Tools</h2>
                <p className="slide-description">High-quality tools for modern farming</p>
                <button className="btn btn-primary" onClick={() => navigate('/products')}>Shop Now</button>
              </div>
            </div>
            <div className={currentSlide === 1 ? "slide active" : "slide"}>
              <img src="/images/banner2.jpg" alt="Organic Plants" className="slide-image" />
              <div className="slide-content">
                <h2 className="slide-title">Organic Plants</h2>
                <p className="slide-description">Fresh and healthy plants for your garden</p>
                <button className="btn btn-primary" onClick={() => navigate('/products')}>Explore Plants</button>
              </div>
            </div>
            <div className={currentSlide === 2 ? "slide active" : "slide"}>
              <img src="/images/banner3.jpg" alt="Gardening Equipment" className="slide-image" />
              <div className="slide-content">
                <h2 className="slide-title">Gardening Essentials</h2>
                <p className="slide-description">Everything you need for successful gardening</p>
                <button className="btn btn-primary" onClick={() => navigate('/products')}>View Equipment</button>
              </div>
            </div>
            
            <button className="slideshow-nav prev" onClick={prevSlide}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <button className="slideshow-nav next" onClick={nextSlide}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
            
            <div className="slideshow-controls">
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className={currentSlide === index ? "slide-dot active" : "slide-dot"}
                  onClick={() => goToSlide(index)}
                ></span>
              ))}
            </div>
          </div>

          {/* Gardening Hero Section */}
          <div className="gardening-hero">
            <div className="hero-content">
              <h1>🌿 Welcome to Gardenia 🌿</h1>
              <p className="hero-subtitle">Your Eco-Friendly Gardening Companion</p>
              <p className="hero-description">
                Cultivate your green thumb with premium organic seeds, sustainable tools, and expert gardening tips. 
                Transform your space into a thriving garden while supporting sustainable farming practices.
              </p>
              <div className="hero-features">
                <div className="feature-box">
                  <span className="feature-icon">🌱</span>
                  <h3>Organic Seeds</h3>
                  <p>Non-GMO, heirloom seeds from trusted suppliers</p>
                </div>
                <div className="feature-box">
                  <span className="feature-icon">🌍</span>
                  <h3>Eco-Friendly Tools</h3>
                  <p>Sustainable gardening equipment for modern farmers</p>
                </div>
                <div className="feature-box">
                  <span className="feature-icon">💚</span>
                  <h3>Plant Care Tips</h3>
                  <p>Expert advice for healthy, thriving gardens</p>
                </div>
                <div className="feature-box">
                  <span className="feature-icon">♻️</span>
                  <h3>Sustainable Supplies</h3>
                  <p>Biodegradable pots, natural fertilizers & more</p>
                </div>
              </div>
            </div>
          </div>

          <main className="products-section">
            <h2>
              {location.search.includes('search=')
                ? `Search Results for "${new URLSearchParams(location.search).get('search')}"`
                : 'Available Products'
              }
            </h2>

          {loadingProducts ? (
            <div className="loader-container">
              <Loader />
            </div>
          ) : products.length === 0 ? (
            <p>No products available at the moment.</p>
          ) : (
            <div className="products-grid">
              {products
                .filter((product) => product.stock > 0)
                .map((product) => {
                  const currentIndex = currentImageIndexes[product._id] || 0;
                  const totalImages = product.images?.length || 0;
                  const hasMultipleImages = totalImages > 1;

                  return (
                    <div
                      key={product._id}
                      className="product-card"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: 15,
                        borderRadius: 12,
                        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                        backgroundColor: "#fff",
                      }}
                    >
                      <div style={{ position: "relative" }}>
                        <img
                          src={product.images?.[currentIndex]?.url}
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "180px",
                            objectFit: "cover",
                            borderRadius: 10,
                          }}
                        />
                        {hasMultipleImages && (
                          <>
                            <button
                              onClick={(e) =>
                                prevImage(product._id, totalImages, e)
                              }
                              style={{
                                position: "absolute",
                                left: 5,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "rgba(0,0,0,0.4)",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: 28,
                                height: 28,
                                fontSize: 14,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              ‹
                            </button>
                            <button
                              onClick={(e) =>
                                nextImage(product._id, totalImages, e)
                              }
                              style={{
                                position: "absolute",
                                right: 5,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "rgba(0,0,0,0.4)",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: 28,
                                height: 28,
                                fontSize: 14,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              ›
                            </button>
                          </>
                        )}
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: 5 }}>
                          {product.name}
                        </h3>
                        <p style={{ marginBottom: 5 }}>Price: ${product.price}</p>
                        <p style={{ marginBottom: 10, color: "#555" }}>
                          Stock: {product.stock}
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          justifyContent: "space-between",
                        }}
                      >
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 5,
                            padding: "8px 10px",
                            backgroundColor: "#1976d2",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 500,
                            transition: "0.3s",
                          }}
                        >
                          <ShoppingCartIcon fontSize="small" /> Add to Cart
                        </button>

                        <button
                          onClick={() => handleCheckoutSolo(product._id)}
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 5,
                            padding: "8px 10px",
                            backgroundColor: "#388e3c",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 500,
                            transition: "0.3s",
                          }}
                        >
                          Checkout <ArrowForwardIcon fontSize="small" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </main>
        </>
      )}
    </div>
  );
};

export default Home;
