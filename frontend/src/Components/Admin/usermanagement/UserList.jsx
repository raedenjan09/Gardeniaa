// Gardenia/frontend/src/Components/admin/userManagement/UserList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as MUIDataTable from "mui-datatables";
import { Button, FormControl, InputLabel, Select, MenuItem, Stack, Box } from "@mui/material";
import Loader from "../../layouts/Loader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BASE_URL = "http://localhost:4001/api/v1";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const originalUsers = showDeleted ? deletedUsers : users;

  useEffect(() => {
    fetchActiveUsers();
    if (token) fetchDeletedUsers();
  }, [token]);

  const fetchActiveUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/users/all`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users/deleted`, { headers: { Authorization: `Bearer ${token}` } });
      setDeletedUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await axios.patch(`${BASE_URL}/users/role/${id}`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
      fetchActiveUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${BASE_URL}/users/status/${id}`, { isActive: newStatus === "Active" }, { headers: { Authorization: `Bearer ${token}` } });
      fetchActiveUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // Soft delete (active users)
  const handleDelete = async () => {
    if (selectedRows.length === 0) return alert("No users selected.");
    if (!window.confirm(`Soft delete ${selectedRows.length} selected users?`)) return;
    try {
      await Promise.all(selectedRows.map(i => {
        const id = originalUsers[i]._id;
        return axios.delete(`${BASE_URL}/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      }));
      fetchActiveUsers();
      fetchDeletedUsers();
      setSelectedRows([]);
    } catch (err) {
      console.error(err);
    }
  };

  // Restore users from Trash
  const handleRestore = async () => {
    if (selectedRows.length === 0) return alert("No users selected.");
    if (!window.confirm(`Restore ${selectedRows.length} selected users?`)) return;
    try {
      await Promise.all(selectedRows.map(i => {
        const id = originalUsers[i]._id;
        return axios.patch(`${BASE_URL}/users/restore/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      }));
      fetchActiveUsers();
      fetchDeletedUsers();
      setSelectedRows([]);
    } catch (err) {
      console.error(err);
    }
  };

  // Permanent delete for users in Trash
  const handlePermanentDelete = async () => {
    if (selectedRows.length === 0) return alert("No users selected.");
    if (!window.confirm(`Permanently delete ${selectedRows.length} selected users? This cannot be undone.`)) return;
    try {
      await Promise.all(selectedRows.map(i => {
        const id = originalUsers[i]._id;
        return axios.delete(`${BASE_URL}/users/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      }));
      fetchDeletedUsers();
      setSelectedRows([]);
      alert('Selected users permanently deleted.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete selected users.');
    }
  };

  const filteredUsers = originalUsers.filter(u =>
    (roleFilter ? u.role === roleFilter : true) &&
    (statusFilter ? (statusFilter === "Active" ? u.isActive : !u.isActive) : true) &&
    (verifiedFilter ? (verifiedFilter === "Verified" ? u.isVerified : !u.isVerified) : true)
  );

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Gardenia', 14, 15);
    doc.setFontSize(12);
    doc.text('User List', 14, 25);

    const tableColumn = ["Name", "Role", "Status", "Verified"];
    const tableRows = [];

    filteredUsers.forEach(u => {
      tableRows.push([
        u.name,
        u.role,
        u.isActive ? "Active" : "Inactive",
        u.isVerified ? "Verified" : "Not Verified"
      ]);
    });

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30 });
    doc.save('UserList.pdf');
  };

  const columns = [
    {
      name: "name",
      label: "Name",
      options: {
        customBodyRenderLite: (dataIndex) => {
          const u = filteredUsers[dataIndex];
          return (
            <span>
              {u.name} {u.isVerified && <img src="/images/verified.jpg" alt="Verified" style={{ width: 16, height: 16, marginLeft: 4 }} />}
            </span>
          );
        }
      }
    },
    {
      name: "role",
      label: "Role",
      options: {
        customBodyRenderLite: (dataIndex) => {
          const u = filteredUsers[dataIndex];
          return !showDeleted ? (
            <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)} style={{ padding: "4px 8px", borderRadius: 5, border: "1px solid #ccc" }}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          ) : u.role;
        }
      }
    },
    {
      name: "status",
      label: "Status",
      options: {
        customBodyRenderLite: (dataIndex) => {
          const u = filteredUsers[dataIndex];
          return !showDeleted ? (
            <select value={u.isActive ? "Active" : "Inactive"} onChange={(e) => handleStatusChange(u._id, e.target.value)} style={{ padding: "4px 8px", borderRadius: 5, border: "1px solid #ccc" }}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          ) : u.isActive ? "Active" : "Inactive";
        }
      }
    },
    {
      name: "_id",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const u = filteredUsers[dataIndex];
          return !showDeleted ? (
            <Button onClick={() => navigate(`/admin/users/view/${u._id}`)}>View</Button>
          ) : null;
        }
      }
    }
  ];

  const options = {
    selectableRows: "multiple",
    selectableRowsOnClick: true,
    rowsSelected: selectedRows,
    onRowSelectionChange: (currentRowsSelected, allRowsSelected, rowsSelected) => {
      const originalIndexes = rowsSelected.map(i => originalUsers.findIndex(u => u._id === filteredUsers[i]._id));
      setSelectedRows(originalIndexes);
    },
    download: false,
    print: false,
    viewColumns: false,
    filter: false,
    search: true,
    rowsPerPage: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
    elevation: 0,
    customToolbarSelect: () => <></>,
    selectableRowsHeader: true
  };

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}><Loader /></div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: "24px auto", padding: 16 }}>
      <h2>{showDeleted ? "Deleted Users (Trash)" : "Active Users"}</h2>

      {/* Filter Dropdowns */}
      <Stack direction="row" spacing={2} mb={2}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Role</InputLabel>
          <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Verified</InputLabel>
          <Select value={verifiedFilter} label="Verified" onChange={(e) => setVerifiedFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Verified">Verified</MenuItem>
            <MenuItem value="NotVerified">Not Verified</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {!showDeleted && <Button variant="contained" onClick={() => navigate("/admin/users/create")}>➕ Create User</Button>}
        <Button variant="contained" color={showDeleted ? "success" : "primary"} onClick={() => setShowDeleted(!showDeleted)}>
          {showDeleted ? "Show Active" : "Trash"}
        </Button>
        {showDeleted ? (
          <>
            <Button variant="contained" color="success" onClick={handleRestore}>Restore Selected</Button>
            <Button variant="contained" color="error" onClick={handlePermanentDelete}>Delete Selected</Button>
          </>
        ) : (
          <Button variant="contained" color="error" onClick={handleDelete}>Delete Selected</Button>
        )}
      </div>

      <MUIDataTable.default data={filteredUsers} columns={columns} options={options} />

      {/* PDF Export Button below table */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
        <Button variant="contained" color="secondary" onClick={exportPDF}>
          CSV
        </Button>
      </Box>
    </div>
  );
}
