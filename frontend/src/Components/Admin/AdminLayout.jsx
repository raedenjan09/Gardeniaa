import React from 'react';
import { getUser } from '../utils/helper';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const user = getUser();

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