import User from "../models/User.js";
import fs from "fs";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import helpers from "../utils/helpers.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import {
    generateOTP,
    getOTPExpiry,
    sendOTPEmail,
    verifyOTPMatch,
} from "../utils/otp.js";

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
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists." });
        }

        // If profile picture is provided, upload it
        let profilePictureUrl = null;
        if (req.file) {
            try {
                profilePictureUrl = await uploadToCloudinary(req.file.path);
                // Delete the local file after uploading
                fs.unlinkSync(req.file.path);
            } catch (error) {
                console.error('Error uploading profile picture:', error);
                return res.status(500).json({ message: "Failed to upload profile picture" });
            }
        }

        // Create new user
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            phone,
            dateOfBirth,
            password,
            profilePicture: profilePictureUrl,
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
 *  @desc User Login
 * @route POST /api/user/login
 * @access Public
 ------------------------------------------*/
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }
        if (!helpers.validateEmail(email)) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password." });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ message: "Login successful.", token });
    } catch (error) {
        console.error("Error logging in user:", error);
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
            updateData.email = email.toLowerCase();
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
        let profilePictureUrl = null;
        if (req.file) {
            try {
                profilePictureUrl = await uploadToCloudinary(req.file.path);
                // Delete the local file after uploading
                fs.unlinkSync(req.file.path);
            } catch (error) {
                console.error('Error uploading profile picture:', error);
                return res.status(500).json({ message: "Failed to upload profile picture" });
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
 * @desc Send OTP for resetting Password
 * @route POST /api/user/send-otp
 ------------------------------------------*/
export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const lowercaseEmail = email.toLowerCase();
        const user = await User.findOne({ email: lowercaseEmail });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiresAt = getOTPExpiry();
        await user.save();

        await sendOTPEmail({
            to: lowercaseEmail,
            otp,
            emailUser: process.env.EMAIL_USER, // or use process.env.EMAIL_USER explicitly
        });

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error sending OTP email:", error);
        res.status(500).json({ error: "Failed to send OTP. Please try again." });
    }
};

/**-----------------------------------------
 * @desc Verify OTP
 * @route POST /api/user/verify-otp
 ------------------------------------------*/
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const lowercaseEmail = email.toLowerCase();
        const user = await User.findOne({ email: lowercaseEmail });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!verifyOTPMatch(user, otp)) {
            return res.status(401).json({ error: "Invalid OTP" });
        }

        res.status(200).json({ message: "OTP correct!" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**-----------------------------------------
 * @desc Update User Password
 * @route PUT /api/user/update-password
 ------------------------------------------*/
export const updateUserPassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    // Check if both fields are provided
    if (!newPassword || !confirmPassword) {
        return res.status(400).json({ message: "Please provide both new password and confirm password" });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    // Validate password strength
    if (!helpers.validatePassword(newPassword)) {
        return res.status(400).json({
            message: "Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character"
        });
    }

    try {
        const lowercaseEmail = email.toLowerCase();
        const user = await User.findOne({ email: lowercaseEmail });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.password = newPassword; // hashing will happen automatically in pre-save

        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error('Password update error:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

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

/**-----------------------------------------
 *  @desc Add Billing Details to User
 * @route POST /api/user/billing
 * @access Private
 * @role User
 ------------------------------------------*/
export const addBillingDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const { cardNumber, expiryDate, cvv, cardHolderName } = req.body;

        // Validate input
        if (!cardNumber || !expiryDate || !cvv || !cardHolderName) {
            return res.status(400).json({ message: "All billing details are required." });
        }
        if (!helpers.validateCardNumber(cardNumber)) {
            return res.status(400).json({ message: "Invalid card number format." });
        }
        if (!helpers.validateCVV(cvv)) {
            return res.status(400).json({ message: "Invalid CVV format." });
        }
        if (!helpers.validateExpiryDate(expiryDate)) {
            return res.status(400).json({ message: "Invalid expiry date format." });
        }

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        // Create billing details object
        const billingDetails = {
            cardNumber,
            expiryDate,
            cvv,
            cardHolderName,
        };

        // Add billing details to user's billingDetails array
        user.billingDetails.push(billingDetails);
        // Save user with updated billing details
        await user.save();
        res.status(201).json({ message: "Billing details added successfully.", billingDetails });
    } catch (error) {
        console.error("Error adding billing details:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}