import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Upload image to Cloudinary
const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'admin-profiles',
      use_filename: true,
      unique_filename: true,
    });
    
    // Delete local file after upload
    fs.unlinkSync(file.path);
    
    return result.secure_url;
  } catch (error) {
    // Delete local file if upload fails
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
};

// @desc    Register new admin
// @route   POST /api/admin/register
// @access  Public
export const registerAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    let imageUrl = null;

    // Handle image upload if file exists
    if (req.file) {
      try {
        imageUrl = await uploadToCloudinary(req.file);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({ message: 'Error uploading image' });
      }
    }

    // Use UI Avatars as default if no image uploaded
    if (!imageUrl) {
      imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128`;
    }

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
      image: imageUrl
    });

    if (admin) {
      res.status(201).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        image: admin.image,
        token: generateToken(admin._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid admin data' });
    }
  } catch (error) {
    console.error('Register admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate admin & get token
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find admin and include password for comparison
    const admin = await Admin.findOne({ email }).select('+password');
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      image: admin.image,
      token: generateToken(admin._id),
    });
  } catch (error) {
    console.error('Login admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin.getPublicProfile());
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private
export const updateAdminProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const { name, email } = req.body;
    let imageUrl = admin.image;

    // Handle image upload if file exists
    if (req.file) {
      try {
        // Delete old image from Cloudinary if exists
        if (admin.image && admin.image.includes('cloudinary')) {
          const publicId = admin.image.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }
        
        imageUrl = await uploadToCloudinary(req.file);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({ message: 'Error uploading image' });
      }
    }

    // Use UI Avatars as default if no image exists
    if (!imageUrl || imageUrl === admin.image) {
      const displayName = name || admin.name;
      imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=128`;
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== admin.email) {
      const emailExists = await Admin.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update fields
    admin.name = name || admin.name;
    admin.email = email || admin.email;
    admin.image = imageUrl;

    const updatedAdmin = await admin.save();

    res.json({
      _id: updatedAdmin._id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      image: updatedAdmin.image,
      token: generateToken(updatedAdmin._id),
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change admin password
// @route   PUT /api/admin/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin.id).select('+password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all admins (for super admin)
// @route   GET /api/admin
// @access  Private
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}).select('-password');
    res.json(admins);
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get admin by ID
// @route   GET /api/admin/:id
// @access  Private
export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    console.error('Get admin by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete admin
// @route   DELETE /api/admin/:id
// @access  Private
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prevent self-deletion
    if (admin._id.toString() === req.admin.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Delete image from Cloudinary if exists
    if (admin.image && admin.image.includes('cloudinary')) {
      try {
        const publicId = admin.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
      }
    }

    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admin removed successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
