const express = require('express');
const {
  createSupplier,
  getAllSuppliers,
  getSupplier,
  updateSupplier,
  softDeleteSupplier,
  getDeletedSuppliers,
  restoreSupplier,
  deleteSupplier,
} = require('../controllers/SupplierController');

const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/suppliers', getAllSuppliers);
router.get('/suppliers/:id', getSupplier);

// ✅ Admin routes
router.get('/admin/suppliers/trash', isAuthenticatedUser, isAdmin, getDeletedSuppliers);
router.get('/admin/suppliers/:id', isAuthenticatedUser, isAdmin, getSupplier);
router.patch('/admin/suppliers/restore/:id', isAuthenticatedUser, isAdmin, restoreSupplier);
router.post('/admin/suppliers', isAuthenticatedUser, isAdmin, createSupplier);
router.put('/admin/suppliers/:id', isAuthenticatedUser, isAdmin, updateSupplier);
router.delete('/admin/suppliers/:id', isAuthenticatedUser, isAdmin, softDeleteSupplier);
router.delete('/admin/suppliers/delete/:id', isAuthenticatedUser, isAdmin, deleteSupplier);

module.exports = router;
