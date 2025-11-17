const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
let firebaseAdmin;

try {
  if (admin.apps.length === 0) {
    // Method 1: Try to use the service account JSON极速赛车开奖结果查询官网 file directly
    const serviceAccountPath = path.join(__dirname, '../service-account-key.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin SDK initialized with service account file');
    } 
    // Method 2: Try environment variables as fallback
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      try {
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        
        // Clean up the private key - remove quotes and handle newlines
        privateKey = privateKey.replace(/^"(.*)"$/, '$1'); // Remove surrounding quotes
        privateKey = privateKey.replace(/\\n/g, '\n');     // Convert \n to actual newlines
        
        firebaseAdmin = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: privateKey,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          }),
        });
        console.log('✅ Firebase Admin SDK initialized with environment variables');
      } catch (envError) {
        console.error('❌ Failed to initialize with environment variables:', envError);
        throw new Error('Firebase Admin SDK initialization failed');
      }
    }
    // Method 3: Use application default credentials (for production)
    else {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      console.log('✅ Firebase Admin SDK initialized with application default credentials');
    }
  } else {
    firebaseAdmin = admin.app();
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization error:', error);
  throw error;
}

class FirebaseAdminService {
  // Generate password reset link
  async generatePasswordResetLink(email) {
    try {
      if (!firebaseAdmin) {
        throw new Error('Firebase Admin SDK not initialized');
      }

      const actionCodeSettings = {
        url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/firebase-reset-password`,
        handleCodeInApp: true, // Use true to let Firebase handle the redirection properly
      };

      const link = await firebaseAdmin.auth().generatePasswordResetLink(email, actionCodeSettings);
      return link;
    } catch (error) {
      console.error('Error generating password reset link:', error);
      throw new Error(`Failed to generate password reset link: ${error.message}`);
    }
  }

  // Get user by UID
  async getUser(uid) {
    try {
      if (!firebaseAdmin) {
        throw new Error('Firebase Admin SDK not initialized');
      }

      const userRecord = await firebaseAdmin.auth().getUser(uid);
      return userRecord;
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }
}

module.exports = new FirebaseAdminService();