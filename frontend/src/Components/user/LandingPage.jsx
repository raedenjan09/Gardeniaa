import React from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1>🌿 Welcome to Gardenia 🌿</h1>
            <p className="hero-subtitle">Your Eco-Friendly Gardening Companion</p>
            <p className="hero-description">
              Discover premium organic seeds, sustainable tools, and expert gardening tips. 
              Transform your space into a thriving garden while supporting sustainable farming practices.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary btn-large">
                Sign In
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="/images/banner1.jpg" alt="Beautiful garden with plants and tools" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="container">
          <h2>Why Choose Gardenia?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>Organic Seeds</h3>
              <p>Non-GMO, heirloom seeds from trusted suppliers with guaranteed quality and sustainability</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Eco-Friendly Tools</h3>
              <p>Sustainable gardening equipment designed for modern farmers and home gardeners</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💚</div>
              <h3>Expert Guidance</h3>
              <p>Comprehensive plant care tips and advice from experienced gardening professionals</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">♻️</div>
              <h3>Sustainable Supplies</h3>
              <p>Biodegradable pots, natural fertilizers, and environmentally conscious gardening supplies</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="landing-benefits">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2>Grow Your Green Thumb</h2>
              <p>
                Whether you're a seasoned gardener or just starting out, Gardenia provides everything you need 
                to create a beautiful, productive garden. Our carefully curated selection of products and 
                resources will help you succeed in your gardening journey.
              </p>
              <ul className="benefits-list">
                <li>✓ High-quality, verified products</li>
                <li>✓ Sustainable and eco-friendly options</li>
                <li>✓ Expert support and community</li>
                <li>✓ Fast and reliable delivery</li>
                <li>✓ Secure and easy shopping experience</li>
              </ul>
            </div>
            <div className="benefits-image">
              <img src="/images/banner2.jpg" alt="Garden benefits illustration" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="container">
          <h2>Ready to Start Your Gardening Journey?</h2>
          <p>Join thousands of happy gardeners who trust Gardenia for their gardening needs</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              Create Account
            </Link>
            <Link to="/login" className="btn btn-outline btn-large">
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;