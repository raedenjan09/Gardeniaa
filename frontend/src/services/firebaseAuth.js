import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  FacebookAuthProvider
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../config/firebase';
import apiClient from '../config/axios';

class FirebaseAuthService {
  // Email/Password login
  async signInWithEmail(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Send user data to backend for sync
      const response = await this.syncUserWithBackend(user, 'email');
      return response;
    } catch (error) {
      console.error('Email sign-in error:', error);
      
      // Provide specific error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Invalid password.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email format.');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled.');
      } else {
        throw new Error(`Login failed: ${error.message}`);
      }
    }
  }

  // Email/Password registration
  async signUpWithEmail(email, password, userData) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Send user data to backend for registration with additional info
      const response = await this.syncUserWithBackend({
        ...user,
        displayName: userData.name,
        additionalData: userData
      }, 'email');
      return response;
    } catch (error) {
      console.error('Email sign-up error:', error);
      
      // Provide specific error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email already in use.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email format.');
      } else {
        throw new Error(`Registration failed: ${error.message}`);
      }
    }
  }

  // Google login
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Send user data to backend for registration/login
      const response = await this.syncUserWithBackend(user, 'google');
      return response;
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      // Provide more specific error messages
      if (error.code === 'auth/configuration-not-found') {
        throw new Error('Firebase configuration error. Please check your Firebase project setup and ensure OAuth providers are enabled.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Login popup was closed. Please try again.');
      } else {
        throw new Error(`Google login failed: ${error.message}`);
      }
    }
  }

  // Facebook login - standard behavior
  async signInWithFacebook() {
    try {
      // Standard Facebook login - will show "Continue as [Your Name]"
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      
      // Send user data to backend for registration/login
      const response = await this.syncUserWithBackend(user, 'facebook');
      return response;
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      
      // Provide more specific error messages
      if (error.code === 'auth/configuration-not-found') {
        throw new Error('Firebase configuration error. Please check your Firebase project setup and ensure OAuth providers are enabled.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Login popup was closed. Please try again.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('This email is already associated with a different login method.');
      } else {
        throw new Error(`Facebook login failed: ${error.message}`);
      }
    }
  }

  // Sync Firebase user with backend
  async syncUserWithBackend(firebaseUser, provider) {
    try {
      const userData = {
        name: firebaseUser.displayName || firebaseUser.additionalData?.name,
        email: firebaseUser.email,
        uid: firebaseUser.uid,
        photoURL: firebaseUser.photoURL,
        provider: provider,
        // Include additional data for email registration
        contact: firebaseUser.additionalData?.contact,
        address: firebaseUser.additionalData?.address
      };

      // Determine the correct endpoint based on provider and context
      let endpoint;
      if (provider === 'email') {
        endpoint = firebaseUser.additionalData ? '/auth/firebase-register' : '/auth/firebase-login';
      } else {
        endpoint = '/auth/social-login';
      }
      
      console.log('Sending request to endpoint:', endpoint);
      console.log('User data being sent:', userData);
      
      const response = await apiClient.post(endpoint, userData);
      
      // Store backend token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      console.error('Backend sync error:', error);
      throw error;
    }
  }

  // Sign out from Firebase only
  async signOutFirebase() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Firebase sign out error:', error);
      throw error;
    }
  }

  // Full sign out (Firebase + local storage)
  async signOut() {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }


  // Auth state listener
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, (user) => {
      callback(user);
    });
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }
}

export default new FirebaseAuthService();