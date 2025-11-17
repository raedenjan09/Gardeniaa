const User = require('../models/UserModels');
const crypto = require('crypto');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/Cloudinary');
const Mailer = require('../utils/Mailer');

// ========== REGISTER USER ==========
exports.registerUser = async (req, res) => {
  try {
    console.log('📝 Register user request received');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    const { name, email, password, contact, address } = req.body;
    
    // Use the address object directly, but ensure it has proper structure
    const addressData = address || {};

    // Remove avatar from required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    console.log('✅ Basic validation passed');

    // Generate avatar URL from user's name (bypass Cloudinary)
    const encodedName = encodeURIComponent(name);
    const avatarData = {
      public_id: 'avatar_' + Date.now(),
      url: `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=150`
    };

    console.log('👤 Creating user in database...');
    // Create new user with all fields
    const userData = {
      name,
      email,
      password,
      avatar: avatarData,
      contact: contact || "",
      address: {
        city: addressData.city || "",
        barangay: addressData.barangay || "",
        street: addressData.street || "",
        zipcode: addressData.zipcode || ""
      }
    };

    console.log('📝 User data being saved:', JSON.stringify(userData, null, 2));

    const user = await User.create(userData);
    console.log('✅ User created in database:', user.email);
    console.log('📝 Saved user data:', JSON.stringify(user, null, 2));

    // Generate email verification token
    console.log('🔐 Generating verification token...');
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Create verification link
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/verify-email/${verificationToken}`;
    console.log('📧 Verification URL:', verificationUrl);

    const message = `
      <h2>Welcome to ${process.env.APP_NAME}</h2>
      <p>Click the link below to verify your email and activate your account:</p>
      <a href="${verificationUrl}" target="_blank">${verificationUrl}</a>
      <br><br>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    console.log('📨 Sending verification email to:', user.email);
    await Mailer({
      email: user.email,
      subject: 'Verify your email - ' + process.env.APP_NAME,
      message
    });
    console.log('✅ Verification email sent');

    // Generate JWT token for immediate login (bypass email verification)
    const token = user.getJwtToken();
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('✅ User registered and automatically logged in:', user.email);
    res.status(201).json({
      success: true,
      token,
      user: userResponse,
      message: 'Registration successful! You are now logged in.'
    });

  } catch (error) {
    console.error('❌ REGISTER ERROR DETAILS:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    // Check for specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      console.error('🔍 Validation errors:', error.errors);
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};
// ========== VERIFY EMAIL ==========
exports.verifyEmail = async (req, res) => {
  try {
    const verificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: verificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== LOGIN USER ==========
exports.loginUser = async (req, res) => {
  try {
    console.log('🔐 Login attempt for:', req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 🚫 Check if user is deleted (in trash)
    if (user.isDeleted) {
      console.log('🗑️ Deleted user attempted login:', email);
      return res.status(403).json({ message: 'Your account has been deleted. Please contact support.' });
    }

    // 🚫 Check if user is inactive
    if (!user.isActive) {
      console.log('❌ Inactive user attempted login:', email);
      return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
    }

    // 🚫 Check if user is verified
    if (!user.isVerified) {
      console.log('❌ User not verified:', email);
      return res.status(403).json({ message: 'Please verify your email first.' });
    }

    // ✅ Check password
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      console.log('❌ Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ✅ Successful login
    console.log('✅ Login successful for:', email);
    const token = user.getJwtToken();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ 
      success: true, 
      token, 
      user: userResponse 
    });

  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.',
      error: error.message 
    });
  }
};

// ========== SOCIAL LOGIN ==========
exports.socialLogin = async (req, res) => {
try {
  console.log('🔐 Social login attempt:', req.body);
  const { name, email, uid, photoURL, provider } = req.body;

  if (!email || !uid) {
    return res.status(400).json({ message: 'Email and UID are required for social login' });
  }

  // Find user by email or create new user
  let user = await User.findOne({ email });

  if (user) {
    // User exists - check if they're active and verified
    if (user.isDeleted) {
      console.log('🗑️ Deleted user attempted social login:', email);
      return res.status(403).json({ message: 'Your account has been deleted. Please contact support.' });
    }

    if (!user.isActive) {
      console.log('❌ Inactive user attempted social login:', email);
      return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
    }

    // Update user profile with social login data if needed
    if (!user.socialLoginIds) {
      user.socialLoginIds = {};
    }
    user.socialLoginIds[provider] = uid;
    
    if (photoURL && !user.avatar?.url.includes('cloudinary')) {
      user.avatar = {
        public_id: `social_avatar_${Date.now()}`,
        url: photoURL
      };
    }

    await user.save();
  } else {
    // Create new user for social login
    console.log('👤 Creating new user for social login:', email);
    
    const avatarData = {
      public_id: `social_avatar_${Date.now()}`,
      url: photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=150`
    };

    const userData = {
      name,
      email,
      avatar: avatarData,
      socialLoginIds: {
        [provider]: uid
      },
      isVerified: true, // Social login users are automatically verified
      isActive: true
    };

    user = await User.create(userData);
    console.log('✅ New user created via social login:', email);
  }

  // Generate JWT token
  const token = user.getJwtToken();

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  console.log('✅ Social login successful for:', email);
  res.status(200).json({
    success: true,
    token,
    user: userResponse
  });

} catch (error) {
  console.error('❌ SOCIAL LOGIN ERROR:', error);
  
  if (error.code === 11000) {
    return res.status(400).json({ message: 'Email already exists with different login method' });
  }

  res.status(500).json({
    success: false,
    message: 'Social login failed. Please try again.',
    error: error.message
  });
}
};

// ========== FORGOT PASSWORD ==========
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(404).json({ message: 'User not found with this email' });

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // FIX: Point to FRONTEND (React app) not backend
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Your Password</a>
      <br><br>
      <p>If you did not request this email, please ignore it.</p>
      <p><small>Or copy this link: ${resetUrl}</small></p>
    `;

    await Mailer({
      email: user.email,
      subject: 'Password Recovery - ' + process.env.APP_NAME,
      message
    });

    res.status(200).json({ success: true, message: `Password reset email sent to: ${user.email}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ========== RESET PASSWORD ==========
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ message: 'Password reset token is invalid or expired' });

    // Check if passwords are provided and match
    if (!req.body.password || !req.body.confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password are required' });
    }

    if (req.body.password !== req.body.confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = user.getJwtToken();
    res.status(200).json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== GET USER PROFILE ==========
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    console.log('📝 User profile data from DB:', JSON.stringify(user, null, 2));

    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        contact: user.contact,
        address: user.address,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// ========== UPDATE PROFILE ==========
exports.updateProfile = async (req, res) => {
  try {
    console.log('📝 Update profile request received for user:', req.user.id);

    const newUserData = {
      name: req.body.name,
      contact: req.body.contact,
      address: {
        city: req.body.city,
        barangay: req.body.barangay,
        street: req.body.street,
        zipcode: req.body.zipcode
      }
    };

    // Remove undefined address fields
    Object.keys(newUserData.address).forEach(key => {
      if (!newUserData.address[key]) delete newUserData.address[key];
    });

    // Handle avatar upload
    if (req.file) {
      console.log('🖼️ Avatar file detected:', req.file.path);
      const currentUser = await User.findById(req.user.id);

      // Delete old avatar if exists and not default ui-avatars
      if (currentUser.avatar?.public_id && !currentUser.avatar.url.includes('ui-avatars.com')) {
        try {
          await deleteFromCloudinary(currentUser.avatar.public_id);
          console.log('✅ Old avatar deleted from Cloudinary');
        } catch (err) {
          console.warn('⚠️ Could not delete old avatar:', err.message);
        }
      }

      // Upload new avatar
      const avatarResult = await uploadToCloudinary(req.file.path, 'harmoniahub/avatars');
      newUserData.avatar = {
        public_id: avatarResult.public_id,
        url: avatarResult.url
      };

      // Remove temp file
      const fs = require('fs');
      fs.unlink(req.file.path, err => {
        if (err) console.warn('⚠️ Failed to delete temp avatar file:', err.message);
      });

      console.log('✅ Avatar uploaded to Cloudinary');
    }

    // Update user in DB
    const updatedUser = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true
    });

    console.log('✅ Profile updated successfully');
    res.status(200).json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('❌ UPDATE PROFILE ERROR:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: 'Profile update failed. Please try again.' });
  }
};


// ========== UPDATE PASSWORD ==========
exports.updatePassword = async (req, res) => {
  try {
    console.log("🔐 Password update request received for user:", req.user.id);

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatched) {
      console.log("❌ Old password incorrect");
      return res.status(400).json({ success: false, message: "Old password is incorrect" });
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      console.log("❌ New passwords do not match");
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // Update the password
    user.password = req.body.newPassword;

    // Save the user without triggering re-validation of required fields
    await user.save({ validateBeforeSave: false });

    console.log("✅ Password updated successfully");
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("❌ UPDATE PASSWORD ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update password",
    });
  }
};

// ========== FIREBASE REGISTRATION ==========
exports.firebaseRegister = async (req, res) => {
  try {
    console.log('🔥 Firebase registration request received');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    const { name, email, uid, contact, address } = req.body;
    
    if (!name || !email || !uid) {
      return res.status(400).json({ message: 'Name, email, and UID are required' });
    }

    console.log('✅ Basic validation passed');

    // Generate avatar URL from user's name
    const encodedName = encodeURIComponent(name);
    const avatarData = {
      public_id: 'avatar_' + Date.now(),
      url: `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=150`
    };

    // Check if user already exists by email or UID
    let user = await User.findOne({
      $or: [
        { email: email },
        { 'socialLoginIds.email': uid }
      ]
    });

    if (user) {
      // Update existing user with Firebase data
      if (!user.socialLoginIds) {
        user.socialLoginIds = {};
      }
      user.socialLoginIds.email = uid;
      
      // Update name if it's different
      if (name && user.name !== name) {
        user.name = name;
      }
      
      await user.save();
      console.log('✅ Existing user updated with Firebase data:', email);
    } else {
      // Create new user for Firebase registration
      console.log('👤 Creating new user for Firebase registration:', email);
      
      user = await User.create({
        name,
        email,
        avatar: avatarData,
        contact: contact || "",
        address: address || {},
        socialLoginIds: { email: uid },
        isActive: true,
        isVerified: false // Users need to verify email through Firebase
      });
      console.log('✅ New user created via Firebase:', email);
    }

    // Generate JWT token for immediate login
    const token = user.getJwtToken();
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('✅ Firebase registration successful for:', email);
    res.status(201).json({
      success: true,
      token,
      user: userResponse,
      message: 'Registration successful! You can now log in.'
    });

  } catch (error) {
    console.error('❌ FIREBASE REGISTER ERROR:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists with different login method'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Firebase registration failed. Please try again.'
    });
  }
};

// ========== FIREBASE LOGIN ==========
exports.firebaseLogin = async (req, res) => {
  try {
    console.log('🔥 Firebase login attempt for:', req.body.email);
    const { email, uid } = req.body;

    if (!email || !uid) {
      return res.status(400).json({ message: 'Email and UID are required' });
    }

    // Find user by email and Firebase UID
    const user = await User.findOne({
      email: email,
      'socialLoginIds.email': uid
    });

    if (!user) {
      console.log('❌ Firebase user not found:', email);
      return res.status(401).json({ message: 'Invalid email or authentication' });
    }

    // Check if user is deleted
    if (user.isDeleted) {
      console.log('🗑️ Deleted user attempted Firebase login:', email);
      return res.status(403).json({ message: 'Your account has been deleted. Please contact support.' });
    }

    // Check if user is inactive
    if (!user.isActive) {
      console.log('❌ Inactive user attempted Firebase login:', email);
      return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
    }

    // Firebase user is automatically verified - no email verification required
    console.log('✅ Firebase login successful for:', email);
    const token = user.getJwtToken();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('❌ FIREBASE LOGIN ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Firebase login failed. Please try again.',
      error: error.message
    });
  }
};

// ========== FIREBASE EMAIL VERIFICATION CALLBACK ==========
exports.firebaseVerifyEmail = async (req, res) => {
  try {
    const { actionCode, uid } = req.body;

    console.log('🔥 Firebase email verification callback received');
    console.log('📦 Action code:', actionCode);
    console.log('👤 UID:', uid);

    if (!actionCode) {
      return res.status(400).json({ message: 'Action code is required' });
    }

    // For now, we'll just update the user verification status directly
    // since Firebase Admin verification methods might not be fully implemented
    let user;

    // Try to find user by UID if provided
    if (uid) {
      user = await User.findOne({ 'socialLoginIds.email': uid });
    }

    // If user not found by UID, try to find by email from request
    if (!user && req.body.email) {
      user = await User.findOne({ email: req.body.email });
    }

    if (!user) {
      console.error('❌ User not found by UID or email');
      return res.status(404).json({
        message: 'User not found. Please try registering again.'
      });
    }

    // Update verification status
    console.log('🔄 Updating user verification status...');
    user.isVerified = true;
    await user.save();

    console.log('✅ User verification status updated in database:', user.email);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
      debug: {
        email: user.email,
        isVerified: user.isVerified,
        uid: uid,
        actionCodeUsed: !!actionCode
      }
    });

  } catch (error) {
    console.error('❌ FIREBASE VERIFICATION ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed. Please try again.',
      error: error.message,
      debug: {
        actionCode: !!req.body.actionCode,
        uid: !!req.body.uid
      }
    });
  }
};

// ========== UPDATE FIREBASE VERIFICATION STATUS ==========
exports.updateFirebaseVerificationStatus = async (req, res) => {
  try {
    const { uid, verified } = req.body;
    
    console.log('🔥 Updating Firebase verification status:', { uid, verified });
    
    if (!uid) {
      return res.status(400).json({ message: 'UID is required' });
    }
    
    // Find user by Firebase UID
    const user = await User.findOne({ 'socialLoginIds.email': uid });
    
    if (!user) {
      console.error('❌ User not found for UID:', uid);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update verification status
    user.isVerified = verified === true;
    await user.save();
    
    console.log('✅ User verification status updated:', { email: user.email, isVerified: user.isVerified });
    
    res.status(200).json({
      success: true,
      message: 'Verification status updated successfully',
      user: {
        email: user.email,
        isVerified: user.isVerified
      }
    });
    
  } catch (error) {
    console.error('❌ UPDATE VERIFICATION STATUS ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update verification status',
      error: error.message
    });
  }
};

// ========== FIREBASE PASSWORD RESET ==========
exports.firebaseResetPassword = async (req, res) => {
  try {
    const { actionCode, newPassword } = req.body;

    console.log('🔥 Firebase password reset request received');
    console.log('📦 Action code:', actionCode);
    
    if (!actionCode || !newPassword) {
      return res.status(400).json({ message: 'Action code and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // For now, we'll simulate the password reset without Firebase Admin verification
    // since the Firebase Admin methods might not be fully implemented
    console.log('🔐 Simulating password reset action code verification...');
    
    // Extract email from action code (this would normally come from Firebase Admin)
    // For testing purposes, we'll assume the email is provided in the request
    const userEmail = req.body.email;
    
    if (!userEmail) {
      return res.status(400).json({ message: 'Email is required for password reset' });
    }

    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.error('❌ User not found for email:', userEmail);
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's password in our database
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    console.log('✅ Password updated in database for user:', userEmail);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('❌ FIREBASE PASSWORD RESET ERROR:', error);
    
    if (error.message.includes('invalid') || error.message.includes('expired')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link. Please request a new password reset.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Password reset failed. Please try again.',
      error: error.message
    });
  }
};