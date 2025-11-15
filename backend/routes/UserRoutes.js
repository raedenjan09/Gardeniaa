const express = require('express');
const upload = require('../utils/Multer');
const {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateProfile,
  updatePassword
} = require('../controllers/UserController');

const { isAuthenticatedUser} = require('../middlewares/auth');

const router = express.Router();

// AUTH
router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginUser);

// PASSWORD
router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);
router.put('/password/update', isAuthenticatedUser, updatePassword);


router.get('/me', isAuthenticatedUser, getUserProfile);
router.put('/me/update', isAuthenticatedUser, upload.single('avatar'), updateProfile);

module.exports = router;
