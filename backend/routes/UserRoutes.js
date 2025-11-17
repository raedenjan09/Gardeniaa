const express = require('express');
const upload = require('../utils/Multer');
const {
  registerUser,
  verifyEmail,
  loginUser,
  socialLogin,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateProfile,
  updatePassword,
  firebaseRegister,
  firebaseLogin,
  firebaseResetPassword,
  firebaseVerifyEmail,
  updateFirebaseVerificationStatus
} = require('../controllers/UserController');

const { isAuthenticatedUser, isUser } = require('../middlewares/auth');

const router = express.Router();

// AUTH
router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginUser);
router.post('/auth/social-login', socialLogin);
router.post('/auth/firebase-register', firebaseRegister);
router.post('/auth/firebase-login', firebaseLogin);
router.post('/auth/firebase-verify-email', firebaseVerifyEmail);
router.post('/auth/firebase-update-verification', updateFirebaseVerificationStatus);

// PASSWORD
router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);
router.put('/password/update', isAuthenticatedUser, isUser, updatePassword);
router.post('/auth/firebase-reset-password', firebaseResetPassword);

// PROFILE
router.get('/me', isAuthenticatedUser, isUser, getUserProfile);
router.put('/me/update', isAuthenticatedUser, isUser, upload.single('avatar'), updateProfile);

module.exports = router;
