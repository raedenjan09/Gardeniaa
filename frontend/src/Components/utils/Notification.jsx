import React, { useState, useEffect } from 'react';
import './Notification.css';

const Notification = () => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const handleAccountStatus = (event) => {
      const { message, type = 'error' } = event.detail;
      setNotification({ message, type });
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    };

    window.addEventListener('showAccountStatus', handleAccountStatus);
    
    return () => {
      window.removeEventListener('showAccountStatus', handleAccountStatus);
    };
  }, []);

  const handleClose = () => {
    setNotification(null);
  };

  if (!notification) return null;

  return (
    <div className={`notification ${notification.type}`}>
      <div className="notification-content">
        <span className="notification-message">{notification.message}</span>
        <button className="notification-close" onClick={handleClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;