// HarmoniaHub/backend/utils/Cloudinary.js
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload to Cloudinary - accepts either:
// - base64 data URL (starting with 'data:')
// - local file path (string) or buffer
const uploadToCloudinary = async (input, folder = 'harmoniahub') => {
  try {
    const uploadOptions = {
      folder: folder,
      resource_type: 'image',
      use_filename: false,
      unique_filename: true,
      overwrite: false
    };

    let toUpload;
    if (typeof input === 'string' && input.startsWith('data:')) {
      // base64 data URL already
      toUpload = input;
    } else {
      // assume file path or buffer
      toUpload = input;
    }

    const result = await cloudinary.uploader.upload(toUpload, uploadOptions);

    return {
      public_id: result.public_id,
      url: result.secure_url
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw new Error('Image upload failed: ' + (error.message || error));
  }
};

// Delete from Cloudinary
const deleteFromCloudinary = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id, { resource_type: 'image' });
    return result;
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
    throw new Error('Image deletion failed: ' + error.message);
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};
