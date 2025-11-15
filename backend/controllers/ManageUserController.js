const User = require('../models/UserModels');



// ✅ Get all users (verified + unverified, not deleted)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false }).select('-password');
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('❌ Error fetching all users:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// Get all verified & not deleted users
exports.getVerifiedUsers = async (req, res) => {
  try {
    const users = await User.find({ isVerified: true, isDeleted: false }).select('-password');
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('❌ Error fetching verified users:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Create a new user (auto-verified)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: 'Email already exists' });

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      isVerified: true, // skip email verification
    });

    res.status(201).json({ success: true, message: 'User created successfully', user });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Toggle user active/inactive
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User has been ${user.isActive ? 'activated' : 'deactivated'}`,
    });
  } catch (error) {
    console.error('❌ Error updating user status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ✅ Change user role (admin <-> user)
exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.role = role;
    await user.save();

    res.status(200).json({ success: true, message: `User role updated to ${role}`, user });
  } catch (error) {
    console.error('❌ Error changing user role:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Soft delete user
exports.softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isDeleted = true;
    user.isActive = false;
    await user.save();

    res.status(200).json({ success: true, message: 'User has been soft deleted' });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Restore a soft-deleted user
exports.restoreUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isDeleted = false;
    user.isActive = true;
    await user.save();

    res.status(200).json({ success: true, message: 'User has been restored' });
  } catch (error) {
    console.error('❌ Error restoring user:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ✅ Get all soft-deleted users
exports.getDeletedUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: true }).select('-password');
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('❌ Error fetching deleted users:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'User permanently deleted' });
  } catch (error) {
    console.error('❌ Error permanently deleting user:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
