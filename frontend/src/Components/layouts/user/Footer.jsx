import React from 'react';
import '../../../index.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="branding">
          <span style={{fontSize:24}}>🍃</span>
          <div>
            <div className="logo-text">Gardenia</div>
            <div style={{fontSize:12, color:'#5b6b55'}}>Eco-friendly gardening marketplace</div>
          </div>
        </div>

        <div className="footer-links">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
