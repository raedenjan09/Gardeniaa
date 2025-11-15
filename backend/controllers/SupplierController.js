const Supplier = require('../models/SupplierModels');
const Product = require('../models/ProductModels');

// Create new supplier   =>  /api/v1/admin/suppliers
exports.createSupplier = async (req, res, next) => {
    try {
        const supplier = await Supplier.create(req.body);

        res.status(201).json({
            success: true,
            supplier
        });
    } catch (error) {
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all active suppliers   =>  /api/v1/suppliers
exports.getAllSuppliers = async (req, res, next) => {
    try {
        const suppliers = await Supplier.find({ isActive: true });

        res.status(200).json({
            success: true,
            count: suppliers.length,
            suppliers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single supplier details   =>  /api/v1/suppliers/:id
exports.getSupplier = async (req, res, next) => {
    try {
        const supplier = await Supplier.findOne({
            _id: req.params.id,
            isActive: true
        });

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        // Get products associated with this supplier
        const products = await Product.find({
            supplier: req.params.id,
            isActive: true
        }).select('name price category stock');

        res.status(200).json({
            success: true,
            supplier: {
                ...supplier.toObject(),
                products
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update supplier   =>  /api/v1/admin/suppliers/:id
exports.updateSupplier = async (req, res, next) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        res.status(200).json({
            success: true,
            supplier
        });
    } catch (error) {
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Soft delete supplier   =>  /api/v1/admin/suppliers/:id
exports.softDeleteSupplier = async (req, res, next) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        // Remove supplier reference from all products
        await Product.updateMany(
            { supplier: req.params.id },
            { $unset: { supplier: 1 } }
        );

        res.status(200).json({
            success: true,
            message: 'Supplier deleted successfully and removed from associated products'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ Get all soft-deleted suppliers (Trash)
exports.getDeletedSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isActive: false }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      count: suppliers.length,
      suppliers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.restoreSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Supplier restored successfully',
      supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        // Remove supplier reference from products before deletion
        await Product.updateMany(
            { supplier: req.params.id },
            { $unset: { supplier: 1 } }
        );

        await supplier.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Supplier permanently deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

  