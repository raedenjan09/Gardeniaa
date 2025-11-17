const fs = require('fs');
const Product = require('../models/ProductModels');
const Supplier = require('../models/SupplierModels');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/Cloudinary');


// Helper to delete local temp file if exists
const safeUnlink = (path) => {
  if (!path) return;
  fs.unlink(path, (err) => {
    if (err) console.warn('Could not delete temp file', path, err.message);
  });
};

// Create new product => /api/v1/admin/products
exports.createProduct = async (req, res, next) => {
  try {
    console.log('🆕 Creating new product...');

    // Supplier check if provided
    if (req.body.supplier) {
      const supplier = await Supplier.findOne({ _id: req.body.supplier, isActive: true });
      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Supplier not found or inactive' });
      }
    }

    const productImages = [];

    // If files were uploaded via Multer
    if (req.files && req.files.length > 0) {
      console.log(`📤 ${req.files.length} files received for upload`);
      for (const file of req.files) {
        try {
          const uploadResult = await uploadToCloudinary(file.path, 'harmoniahub/products');
          productImages.push({
            public_id: uploadResult.public_id,
            url: uploadResult.url
          });
        } catch (err) {
          // remove any temp file
          safeUnlink(file.path);
          console.error('❌ Upload failed for file', file.path, err.message);
          return res.status(400).json({ success: false, message: 'Image upload failed: ' + err.message });
        } finally {
          // always clean up temp file
          safeUnlink(file.path);
        }
      }
    } else if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
      // Fallback for backwards compatibility: accept images array (public_id+url)
      for (const img of req.body.images) {
        productImages.push(img);
      }
    }

    const productData = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      supplier: req.body.supplier || undefined,
      stock: req.body.stock,
      images: productImages
    };

    const product = await Product.create(productData);

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('❌ CREATE PRODUCT ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all products   =>  /api/v1/products
exports.getAllProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments({ isActive: true });
        const products = await Product.find({ isActive: true })
            .populate('supplier', 'name email')
            .populate('reviews.user', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: products.length,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProduct = async (req, res, next) => {
  try {
    // Admin can fetch any product
    const product = await Product.findById(req.params.id)
      .populate('supplier', 'name email phone address')
      .populate('reviews.user', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update product => /api/v1/admin/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    console.log('📝 Updating product:', req.params.id);

    // Supplier validation if provided
    if (req.body.supplier) {
      const supplier = await Supplier.findOne({ _id: req.body.supplier, isActive: true });
      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Supplier not found or inactive' });
      }
    }

    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) return res.status(404).json({ success: false, message: 'Product not found' });

    // existingImages can be sent as JSON string from frontend to indicate images we want to keep
    let existingImages = [];
    if (req.body.existingImages) {
      try {
        existingImages = typeof req.body.existingImages === 'string'
          ? JSON.parse(req.body.existingImages)
          : req.body.existingImages;
      } catch (err) {
        existingImages = [];
      }
    }

    const newImages = [...existingImages]; // start with images to keep
    const imagesToDelete = [];

    // Any existing images in DB not present in existingImages should be removed
    for (const oldImg of currentProduct.images) {
      const found = existingImages.some(i => (i.public_id && i.public_id === oldImg.public_id) || (i.url && i.url === oldImg.url));
      if (!found && oldImg.public_id && !oldImg.public_id.startsWith('local_')) {
        imagesToDelete.push(oldImg.public_id);
      }
    }

    // Upload any files present in req.files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const uploadResult = await uploadToCloudinary(file.path, 'harmoniahub/products');
          newImages.push({
            public_id: uploadResult.public_id,
            url: uploadResult.url
          });
        } catch (err) {
          console.error('❌ New image upload failed:', err.message);
          // don't abort whole update - still try to proceed
        } finally {
          safeUnlink(file.path);
        }
      }
    }

    // Delete images that were removed by admin from Cloudinary
    for (const publicId of imagesToDelete) {
      try {
        await deleteFromCloudinary(publicId);
        console.log('✅ Deleted old image from Cloudinary:', publicId);
      } catch (deleteError) {
        console.warn('⚠️ Could not delete image from Cloudinary:', deleteError.message);
      }
    }

    // Prepare update payload
    const updatePayload = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      supplier: req.body.supplier || undefined,
      stock: req.body.stock,
      images: newImages
    };

    const product = await Product.findByIdAndUpdate(req.params.id, updatePayload, { new: true, runValidators: true }).populate('supplier', 'name email');

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('❌ UPDATE PRODUCT ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Soft delete product   =>  /api/v1/admin/products/:id
exports.softDeleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get active suppliers for dropdown   =>  /api/v1/suppliers/dropdown
exports.getActiveSuppliers = async (req, res, next) => {
    try {
        const suppliers = await Supplier.find({ isActive: true })
            .select('name email');

        res.status(200).json({
            success: true,
            suppliers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ Soft delete product   =>  /api/v1/admin/products/:id
exports.softDeleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product soft-deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ProductController.js
exports.getDeletedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: false }).sort({ updatedAt: -1 }).populate('supplier', 'name');
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.restoreProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Product restored successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete images from Cloudinary first
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.public_id && !img.public_id.startsWith('local_')) {
          try {
            await deleteFromCloudinary(img.public_id);
            console.log('✅ Deleted image from Cloudinary:', img.public_id);
          } catch (err) {
            console.warn('⚠️ Could not delete image from Cloudinary:', err.message);
          }
        }
      }
    }

    // Remove the product from DB
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product permanently deleted from database'
    });
  } catch (error) {
    console.error('❌ DELETE PRODUCT ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search products => /api/v1/products/search
exports.searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchRegex = new RegExp(q, 'i'); // case-insensitive search

    const query = {
      isActive: true,
      $or: [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { category: { $regex: searchRegex } }
      ]
    };

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('supplier', 'name email')
      .populate('reviews.user', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      products
    });
  } catch (error) {
    console.error('❌ SEARCH PRODUCTS ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};