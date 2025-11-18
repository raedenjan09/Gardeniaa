// Gardenia/frontend/src/Components/admin/productmanagement/ViewProduct.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import Loader from '../../layouts/Loader';

const BASE_URL = 'http://localhost:4001/api/v1';

export default function ViewProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/products/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setProduct(res.data.product);
        setCurrentImageIndex(0);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, token]);

  const nextImage = () => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader />
      </div>
    );
  }

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '24px auto', padding: 16 }}>
      <Button variant="outlined" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        ← Back
      </Button>
      <h2>{product.name}</h2>
      <p><strong>Category:</strong> {product.category}</p>
      <p><strong>Price:</strong> ₱{product.price}</p>
      <p><strong>Stock:</strong> {product.stock}</p>
      <p><strong>Supplier:</strong> {product.supplier?.name || '—'}</p>
      <p><strong>Description:</strong> {product.description || 'No description provided.'}</p>

      {product.images?.length > 0 ? (
        <div style={{ position: 'relative', width: 400, height: 400, margin: '16px 0' }}>
          <img
            src={product.images[currentImageIndex].url}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
          />
          {product.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                style={{
                  position: 'absolute',
                  left: 2,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 30,
                  height: 30,
                  cursor: 'pointer'
                }}
              >‹</button>
              <button
                onClick={nextImage}
                style={{
                  position: 'absolute',
                  right: 2,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 30,
                  height: 30,
                  cursor: 'pointer'
                }}
              >›</button>
              <div style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                fontSize: 12,
                padding: '2px 6px',
                borderRadius: 8
              }}>
                {currentImageIndex + 1}/{product.images.length}
              </div>
            </>
          )}
        </div>
      ) : (
        <p>No images available.</p>
      )}
    </div>
  );
}
