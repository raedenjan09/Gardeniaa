// Gardenia/frontend/src/Components/admin/productmanagement/ProductList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as MUIDataTable from "mui-datatables";
import { Button, Box, FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material';
import Loader from '../../layouts/Loader';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BASE_URL = 'http://localhost:4001/api/v1';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [suppliers, setSuppliers] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const categoryOptions = [
    'Indoor Plants',
    'Outdoor Plants',
    'Seeds',
    'Soil & Fertilizers',
    'Tools & Accessories',
    'Planters & Pots'
  ];

  const displayedProducts = (showDeleted ? deletedProducts : products).filter(p => {
    return (categoryFilter ? p.category === categoryFilter : true) &&
           (supplierFilter ? p.supplier?.name === supplierFilter : true);
  });

  useEffect(() => {
    fetchActiveProducts();
    if (token) fetchDeletedProducts();
    fetchSuppliers();
  }, [token]);

  const fetchActiveProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/products`);
      setProducts(res.data.products || []);

      const initialIndexes = {};
      res.data.products?.forEach(p => {
        if (p.images?.length > 0) initialIndexes[p._id] = 0;
      });
      setCurrentImageIndexes(initialIndexes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/products/trash`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setDeletedProducts(res.data.products || []);

      const initialIndexes = {};
      res.data.products?.forEach(p => {
        if (p.images?.length > 0) initialIndexes[p._id] = 0;
      });
      setCurrentImageIndexes(prev => ({ ...prev, ...initialIndexes }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/suppliers/dropdown`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setSuppliers(res.data.suppliers?.map(s => s.name) || []);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    }
  };

  const nextImage = (id, total) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [id]: (prev[id] + 1) % total
    }));
  };

  const prevImage = (id, total) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [id]: (prev[id] - 1 + total) % total
    }));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return alert('No products selected.');
    if (!window.confirm(`Soft delete ${selectedIds.length} selected products?`)) return;

    try {
      await Promise.all(selectedIds.map(id =>
        axios.delete(`${BASE_URL}/admin/products/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      ));
      fetchActiveProducts();
      fetchDeletedProducts();
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async () => {
    if (selectedIds.length === 0) return alert('No products selected.');
    if (!window.confirm(`Restore ${selectedIds.length} selected products?`)) return;

    try {
      await Promise.all(selectedIds.map(id =>
        axios.patch(`${BASE_URL}/admin/products/restore/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } })
      ));
      fetchActiveProducts();
      fetchDeletedProducts();
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleHardDelete = async (id) => {
    if (!window.confirm(`Permanently delete this product? This cannot be undone.`)) return;
    try {
      await axios.delete(`${BASE_URL}/admin/products/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDeletedProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkHardDelete = async () => {
    if (selectedIds.length === 0) return alert('No products selected.');
    if (!window.confirm(`Permanently delete ${selectedIds.length} selected products? This cannot be undone.`)) return;

    try {
      await Promise.all(selectedIds.map(id =>
        axios.delete(`${BASE_URL}/admin/products/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      ));
      fetchDeletedProducts();
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Gardenia', 14, 15);

    doc.setFontSize(12);
    doc.text('Product List', 14, 25);

    const tableColumn = ["Name", "Price", "Category", "Stock", "Supplier"];
    const tableRows = [];

    displayedProducts.forEach(product => {
      tableRows.push([
        product.name,
        product.price,
        product.category,
        product.stock,
        product.supplier?.name || '—'
      ]);
    });

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30 });
    doc.save('ProductList.pdf');
  };

  const columns = [
    {
      name: "images",
      label: "Image",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const product = displayedProducts[dataIndex];
          const total = product.images?.length || 0;
          const currentIndex = currentImageIndexes[product._id] || 0;
          if (total === 0) return '—';
          return (
            <div style={{ position: 'relative', width: 60, height: 60 }}>
              <img
                src={product.images[currentIndex].url}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
              />
              {total > 1 && (
                <>
                  <button
                    onClick={() => prevImage(product._id, total)}
                    style={{
                      position: 'absolute', left: 2, top: '50%',
                      transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)',
                      color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20
                    }}>‹</button>
                  <button
                    onClick={() => nextImage(product._id, total)}
                    style={{
                      position: 'absolute', right: 2, top: '50%',
                      transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)',
                      color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20
                    }}>›</button>
                  <div style={{
                    position: 'absolute', bottom: 2, right: 2,
                    background: 'rgba(0,0,0,0.6)', color: '#fff',
                    fontSize: 10, padding: '1px 4px', borderRadius: 8
                  }}>
                    {currentIndex + 1}/{total}
                  </div>
                </>
              )}
            </div>
          );
        }
      }
    },
    { name: "name", label: "Name" },
    { name: "price", label: "Price" },
    { name: "category", label: "Category" },
    { name: "stock", label: "Stock" },
    {
      name: "supplier",
      label: "Supplier",
      options: {
        customBodyRenderLite: (dataIndex) => displayedProducts[dataIndex].supplier?.name || '—'
      }
    },
    {
      name: "_id",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const product = displayedProducts[dataIndex];
          if (showDeleted) {
            return null; // ✅ No actions in Trash
          } else {
            return (
              <>
                <Button onClick={() => navigate(`/admin/products/view/${product._id}`)}>View</Button>
                <Button onClick={() => navigate(`/admin/products/edit/${product._id}`)}>Edit</Button>
              </>
            );
          }
        }
      }
    }
  ];

  const options = {
    selectableRows: "multiple",
    selectableRowsOnClick: true,
    rowsSelected: displayedProducts.map((p, i) => selectedIds.includes(p._id) ? i : null).filter(i => i !== null),
    onRowSelectionChange: (currentRowsSelected, allRowsSelected, rowsSelectedIndexes) => {
      const ids = rowsSelectedIndexes.map(i => displayedProducts[i]._id);
      setSelectedIds(ids);
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
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '24px auto', padding: 16, position: 'relative' }}>
      <h2>{showDeleted ? 'Deleted Products (Trash)' : 'Active Products'}</h2>

      <Stack direction="row" spacing={2} mb={2}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Category</InputLabel>
          <Select value={categoryFilter} label="Category" onChange={e => setCategoryFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {categoryOptions.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Supplier</InputLabel>
          <Select value={supplierFilter} label="Supplier" onChange={e => setSupplierFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {suppliers.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {!showDeleted && <Button variant="contained" onClick={() => navigate('/admin/products/new')}>➕ Create Product</Button>}
        <Button variant="contained" color="primary" onClick={() => setShowDeleted(!showDeleted)}>
          {showDeleted ? 'Show Active' : 'Trash'}
        </Button>

        {showDeleted ? (
          <>
            <Button variant="contained" color="success" onClick={handleRestore}>Restore Selected</Button>
            <Button variant="contained" color="error" onClick={handleBulkHardDelete}>Delete Selected</Button>
          </>
        ) : (
          <Button variant="contained" color="error" onClick={handleBulkDelete}>Delete Selected</Button>
        )}
      </div>

      <MUIDataTable.default
        data={displayedProducts}
        columns={columns}
        options={options}
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
        <Button variant="contained" color="secondary" onClick={exportPDF}>
          CSV
        </Button>
      </Box>
    </div>
  );
}
