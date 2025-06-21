import User from "../models/User";
import fs from "fs";
import { uploadToCloudinary } from "../utils/cloudinary";
import helpers from "../utils/helpers";

/**-----------------------------------------
 *  @desc Add a new User
 * @route POST /api/user
 * @access Public
 ------------------------------------------*/
export const registerUser = async (req, res) => {
    try {
        const { name, email, phone, dateOfBirth, password } = req.body;

        // Validate input
        if (!name || !email || !phone || !dateOfBirth || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }
        if (!helpers.validateEmail(email)) {
            return res.status(400).json({ message: "Invalid email format." });
        }
        if (!helpers.validatePhone(phone)) {
            return res.status(400).json({ message: "Invalid phone number format." });
        }
        if (!helpers.validateDOB(dateOfBirth)) {
            return res.status(400).json({ message: "You must be at least 16 years old." });
        }
        if (!helpers.validatePassword(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character.",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists." });
        }

        // If profile picture is provided, upload it
        let profilePictureUrl = "";
        if (req.file) {
            try {
                const uploadResult = await uploadToCloudinary(req.file.path);
                profilePictureUrl = uploadResult.secure_url;

                // Remove the file from local storage after uploading
                fs.unlinkSync(req.file.path);
            } catch (error) {
                console.error("Error uploading profile picture:", error);
                return res.status(500).json({ message: "Error uploading profile picture." });
            }
        }

        // Create new user
        const newUser = new User({
            name,
            email,
            phone,
            dateOfBirth,
            password,
            profilePicture: profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128`,
            billingDetails: [],
        });

        // Save user to database
        await newUser.save();

        res.status(201).json({ message: "User registered successfully.", user: newUser });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

/**-----------------------------------------
 *  @desc Get All User Profiles
 * @route GET /api/user
 * @access Private
 * @role Admin
 ------------------------------------------*/
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

/**-----------------------------------------
 *  @desc Get User Profile by ID
 * @route GET /api/user/:id
 * @access Private
 * @role User, Admin
 ------------------------------------------*/
export const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

/**-----------------------------------------
 *  @desc Update User Profile
 * @route PUT /api/user/:id
 * @access Private
 * @role User, Admin
 ------------------------------------------*/
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, phone, dateOfBirth } = req.body;

        // Only update fields that are provided
        const updateData = {};
        if (name) updateData.name = name;
        if (email) {
            if (!helpers.validateEmail(email)) {
                return res.status(400).json({ message: "Invalid email format." });
            }
            updateData.email = email;
        }
        if (phone) {
            if (!helpers.validatePhone(phone)) {
                return res.status(400).json({ message: "Invalid phone number format." });
            }
            updateData.phone = phone;
        }
        if (dateOfBirth) {
            if (!helpers.validateDOB(dateOfBirth)) {
                return res.status(400).json({ message: "You must be at least 16 years old." });
            }
            updateData.dateOfBirth = dateOfBirth;
        }
        // If profile picture is provided, upload it
        let profilePictureUrl = "";
        if (req.file) {
            try {
                const uploadResult = await uploadToCloudinary(req.file.path);
                profilePictureUrl = uploadResult.secure_url;

                // Remove the file from local storage after uploading
                fs.unlinkSync(req.file.path);
            } catch (error) {
                console.error("Error uploading profile picture:", error);
                return res.status(500).json({ message: "Error uploading profile picture." });
            }
        }

        if (profilePictureUrl) {
            updateData.profilePicture = profilePictureUrl;
        }
        // Find user and update
        const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ message: "User profile updated successfully.", user });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

/**-----------------------------------------
 *  @desc Update User Password
 * @route PUT /api/user/:id
 * @access Private
 * @role User
 ------------------------------------------*/
export const updateUserPassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const { currentPassword, newPassword } = req.body;

        // Validate new password
        if (!helpers.validatePassword(newPassword)) {
            return res.status(400).json({
                message: "New password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character.",
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect." });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Error updating user password:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

/**-----------------------------------------
 *  @desc Delete User Profile
 * @route DELETE /api/user/:id
 * @access Private
 * @role Admin
 ------------------------------------------*/
export const deleteUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find user and delete
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ message: "User profile deleted successfully." });
    } catch (error) {
        console.error("Error deleting user profile:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}