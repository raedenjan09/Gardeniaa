const express = require('express');
const upload = require('../utils/Multer'); // multer instance
const {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  softDeleteProduct,
  getActiveSuppliers,
  getDeletedProducts,
  restoreProduct,
  searchProducts,
  getProductStats,
  getAllAdminProducts
} = require('../controllers/ProductController');

const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/products', getAllProducts);
router.get('/products/search', searchProducts);
router.get('/products/:id', getProduct);
router.get('/suppliers/dropdown', getActiveSuppliers);

// Admin routes
router.get('/admin/products/all', isAuthenticatedUser, isAdmin, getAllAdminProducts);
router.get('/admin/products/trash', isAuthenticatedUser, isAdmin, getDeletedProducts);
router.patch('/admin/products/restore/:id', isAuthenticatedUser, isAdmin, restoreProduct);
router.get('/admin/products/:id', isAuthenticatedUser, isAdmin, getProduct);
router.get('/admin/products/stats', isAuthenticatedUser, isAdmin, getProductStats);

// Use upload.array('images') for create and update (max 5)
router.post('/admin/products', isAuthenticatedUser, isAdmin, upload.array('images', 5), createProduct);
router.put('/admin/products/:id', isAuthenticatedUser, isAdmin, upload.array('images', 5), updateProduct);
router.delete('/admin/products/:id', isAuthenticatedUser, isAdmin, softDeleteProduct);
router.delete('/admin/products/delete/:id', isAuthenticatedUser, isAdmin, deleteProduct);

module.exports = router;