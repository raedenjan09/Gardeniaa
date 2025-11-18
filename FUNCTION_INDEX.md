# Gardenia Project Function Index

## 📋 Overview
This document provides a comprehensive index of all functions and their code locations across the Gardenia project. Organized by category for easy reference during crisis situations.

## 🔐 Authentication & User Management

### Backend Controllers (`backend/controllers/UserController.js`)

**User Registration & Login:**
```javascript
exports.registerUser = async (req, res) => { ... }  // Lines 7-119
exports.verifyEmail = async (req, res) => { ... }   // Lines 121-146
exports.loginUser = async (req, res) => { ... }     // Lines 149-212
exports.socialLogin = async (req, res) => { ... }   // Lines 215-303
```

**Password Management:**
```javascript
exports.forgotPassword = async (req, res) => { ... }  // Lines 307-338
exports.resetPassword = async (req, res) => { ... }   // Lines 340-370
exports.updatePassword = async (req, res) => { ... }  // Lines 477-517
```

**Profile Management:**
```javascript
exports.getUserProfile = async (req, res) => { ... }  // Lines 373-397
exports.updateProfile = async (req, res) => { ... }   // Lines 402-473
```

**Firebase Integration:**
```javascript
exports.firebaseRegister = async (req, res) => { ... }          // Lines 520-617
exports.firebaseLogin = async (req, res) => { ... }             // Lines 620-674
exports.firebaseVerifyEmail = async (req, res) => { ... }       // Lines 677-739
exports.updateFirebaseVerificationStatus = async (req, res) => { ... }  // Lines 743-784
exports.firebaseResetPassword = async (req, res) => { ... }     // Lines 787-847
```

### User Management (`backend/controllers/ManageUserController.js`)
```javascript
exports.getAllUsers = async (req, res) => { ... }            // Lines 6-14
exports.getVerifiedUsers = async (req, res) => { ... }       // Lines 16-24
exports.createUser = async (req, res) => { ... }             // Lines 27-48
exports.toggleUserStatus = async (req, res) => { ... }       // Lines 51-68
exports.changeUserRole = async (req, res) => { ... }         // Lines 72-92
exports.softDeleteUser = async (req, res) => { ... }         // Lines 95-110
exports.restoreUser = async (req, res) => { ... }            // Lines 113-128
exports.getDeletedUsers = async (req, res) => { ... }        // Lines 131-139
exports.getUserById = async (req, res) => { ... }            // Lines 141-151
exports.deleteUser = async (req, res) => { ... }             // Lines 154-165
```

### Authentication Middleware (`backend/middlewares/auth.js`)
```javascript
exports.isAuthenticatedUser = async (req, res, next) => { ... }  // Lines 4-20
exports.isAdmin = async (req, res, next) => { ... }              // Lines 23-29
exports.isUser = async (req, res, next) => { ... }               // Lines 32-38
```

### Frontend Firebase Service (`frontend/src/services/firebaseAuth.js`)
```javascript
async signInWithEmail(email, password) { ... }           // Lines 14-38
async signUpWithEmail(email, password, userData) { ... } // Lines 41-67
async signInWithGoogle() { ... }                         // Lines 70-90
async signInWithFacebook() { ... }                       // Lines 93-116
async syncUserWithBackend(firebaseUser, provider) { ... }// Lines 119-154
async signOutFirebase() { ... }                          // Lines 157-164
async signOut() { ... }                                  // Lines 167-176
onAuthStateChange(callback) { ... }                      // Lines 180-184
getCurrentUser() { ... }                                 // Lines 187-189
```

## 🛒 Product Management

### Product Controller (`backend/controllers/ProductController.js`)
```javascript
exports.createProduct = async (req, res, next) => { ... }      // Lines 16-74
exports.getAllProducts = async (req, res, next) => { ... }     // Lines 77-105
exports.getProduct = async (req, res, next) => { ... }         // Lines 107-131
exports.updateProduct = async (req, res, next) => { ... }      // Lines 134-220
exports.softDeleteProduct = async (req, res, next) => { ... }  // Lines 223-248 & 269-294
exports.getActiveSuppliers = async (req, res, next) => { ... } // Lines 251-266
exports.getDeletedProducts = async (req, res) => { ... }       // Lines 297-308
exports.restoreProduct = async (req, res) => { ... }           // Lines 310-330
exports.deleteProduct = async (req, res) => { ... }            // Lines 332-365
exports.searchProducts = async (req, res, next) => { ... }     // Lines 368-416
```

## 🛍️ Cart & Checkout

### Cart Controller (`backend/controllers/CartController.js`)
```javascript
exports.addToCart = async (req, res) => { ... }          // Lines 5-38
exports.getCart = async (req, res) => { ... }            // Lines 41-49
exports.updateCartItem = async (req, res) => { ... }     // Lines 52-80
exports.removeCartItem = async (req, res) => { ... }     // Lines 83-99
exports.clearCart = async (req, res) => { ... }          // Lines 102-110
```

### Checkout Controller (`backend/controllers/CheckoutController.js`)
```javascript
exports.checkout = async (req, res) => { ... }           // Lines 9-113
createOrderConfirmationEmailTemplate(order, user) { ... } // Lines 116-196
```

## 📦 Order Management

### Order Controller (`backend/controllers/OrderController.js`)
```javascript
exports.getMyOrders = async (req, res) => { ... }              // Lines 4-13
exports.markOrderAsDelivered = async (req, res) => { ... }     // Lines 16-46
```

## ⭐ Review System

### Review Controller (`backend/controllers/ReviewController.js`)
```javascript
exports.createReview = async (req, res) => { ... }      // Lines 36-105
exports.updateReview = async (req, res) => { ... }      // Lines 108-171
exports.getProductReviews = async (req, res) => { ... } // Lines 174-188
```

## 🏠 Frontend Components

### Home Component (`frontend/src/Components/user/Home.jsx`)
**Key Functions:**
- `fetchData()` - Loads user data and products (Lines 31-81)
- `fetchMoreProducts()` - Infinite scroll loading (Lines 84-117)
- `handleAddToCart()` - Add product to cart (Lines 172-192)
- `handleCheckoutSolo()` - Direct checkout (Lines 194-212)
- `handleViewProduct()` - Navigate to product detail (Lines 214-216)
- `handleLogout()` - User logout (Lines 218-221)

## 🚨 Crisis Response Functions

### Critical Authentication Functions:
1. **User Login**: [`loginUser()`](backend/controllers/UserController.js:149) - Handles user authentication
2. **Token Validation**: [`isAuthenticatedUser()`](backend/middlewares/auth.js:4) - Validates JWT tokens
3. **Firebase Login**: [`signInWithEmail()`](frontend/src/services/firebaseAuth.js:14) - Firebase auth integration

### Emergency User Management:
1. **User Status Toggle**: [`toggleUserStatus()`](backend/controllers/ManageUserController.js:51) - Activate/deactivate users
2. **User Recovery**: [`restoreUser()`](backend/controllers/ManageUserController.js:113) - Restore soft-deleted users
3. **Password Reset**: [`resetPassword()`](backend/controllers/UserController.js:340) - Emergency password reset

### Product Crisis Functions:
1. **Product Deletion**: [`softDeleteProduct()`](backend/controllers/ProductController.js:223) - Remove products safely
2. **Product Restoration**: [`restoreProduct()`](backend/controllers/ProductController.js:310) - Restore deleted products
3. **Emergency Search**: [`searchProducts()`](backend/controllers/ProductController.js:368) - Find products quickly

### Order Management:
1. **Order Status Update**: [`markOrderAsDelivered()`](backend/controllers/OrderController.js:16) - Mark orders as delivered
2. **Checkout Processing**: [`checkout()`](backend/controllers/CheckoutController.js:9) - Process orders

## 📊 Utility Functions

### Image Management (`ProductController.js`):
```javascript
safeUnlink(path) { ... }  // Lines 8-13 - Safe file deletion
```

### Email Templates (`CheckoutController.js`):
```javascript
createOrderConfirmationEmailTemplate(order, user) { ... }  // Lines 116-196
```

### Profanity Filter (`ReviewController.js`):
```javascript
// Custom bad words filter initialization (Lines 5-34)
```

## 🔗 API Endpoints Summary

**User Routes**: `/api/v1/auth/*` - Registration, login, password reset
**Product Routes**: `/api/v1/products/*` - Product CRUD operations  
**Cart Routes**: `/api/v1/cart/*` - Shopping cart management
**Order Routes**: `/api/v1/orders/*` - Order processing
**Admin Routes**: `/api/v1/admin/*` - Administrative functions

## 📝 Usage Notes

1. **Authentication Required**: Most functions require valid JWT tokens in Authorization header
2. **Admin Privileges**: Functions marked with admin middleware require admin role
3. **Error Handling**: All functions include comprehensive error handling with appropriate HTTP status codes
4. **Logging**: Critical operations include console logging for debugging purposes

This index provides quick access to all major functions during system crises or debugging scenarios.