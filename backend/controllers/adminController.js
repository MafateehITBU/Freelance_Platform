import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { v2 as cloudinary } from 'cloudinary';
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
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

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    let imageUrl = null;

    if (req.file) {
      try {
        imageUrl = await uploadToCloudinary(req.file.path, "admin-profiles", "image");
      } catch (error) {
        console.error("Image upload error:", error);
        return res.status(500).json({ message: "Error uploading image" });
      }
    }

    if (!imageUrl) {
      imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128`;
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      image: imageUrl,
    });

    if (!admin) {
      return res.status(400).json({ message: "Invalid admin data" });
    }

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      image: admin.image,
      token: generateToken(admin._id),
    });
  } catch (error) {
    console.error("Register admin error:", error);
    res.status(500).json({ message: "Server error" });
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
    const admin = await Admin.findById(req.user.id);
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

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const { name, email } = req.body;
    let imageUrl = admin.image;

    // Handle new image upload
    if (req.file) {
      try {
        if (admin.image && admin.image.includes("cloudinary")) {
          await deleteFromCloudinary(admin.image, "admin-profiles");
        }

        imageUrl = await uploadToCloudinary(req.file.path, "admin-profiles", "image");
      } catch (error) {
        console.error("Image upload error:", error);
        return res.status(500).json({ message: "Error uploading image" });
      }
    }

    if (!imageUrl || imageUrl === admin.image) {
      const displayName = name || admin.name;
      imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=128`;
    }

    // Check email uniqueness if changed
    if (email && email !== admin.email) {
      const emailExists = await Admin.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
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
    console.error("Update admin profile error:", error);
    res.status(500).json({ message: "Server error" });
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

    const admin = await Admin.findById(req.user.id).select('+password');
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
    if (admin._id.toString() === req.user.id) {
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
