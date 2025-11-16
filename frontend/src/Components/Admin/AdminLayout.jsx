import React, { useState, useEffect } from 'react';
import { getUser } from '../utils/helper';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    // Listen for storage changes (when profile is updated in AdminProfile)
    const handleStorageChange = () => {
      const updatedUser = getUser();
      setUser(updatedUser);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event from AdminProfile component
    window.addEventListener('profileUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleStorageChange);
    };
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar user={user} />
      <main className="admin-main-content">
        <div className="admin-content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;