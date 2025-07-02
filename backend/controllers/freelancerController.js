import Freelancer from "../models/Freelancer.js";
import Wallet from "../models/Wallet.js";
import Service from "../models/Service.js";
import AddOn from "../models/AddOn.js";
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
import { transporter } from "../utils/nodemailer.js";

/**-----------------------------------------
 *  @desc Add a new Freelancer
 *  @route POST /api/freelancer
 * @access Public
 ------------------------------------------*/
export const addFreelancer = async (req, res) => {
    try {
        const { name, email, password, phone, dateOfBirth } = req.body;

        // Validate required fields
        if (!name || !email || !password || !phone || !dateOfBirth) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if freelancer already exists
        const existingFreelancer = await Freelancer.findOne({ email: email.toLowerCase() });
        if (existingFreelancer) {
            return res.status(400).json({ message: "Freelancer already exists" });
        }

        // Validate inputs
        if (!helpers.validateEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (!helpers.validatePhone(phone)) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }
        if (!helpers.validateDOB(dateOfBirth)) {
            return res.status(400).json({ message: "Invalid date of birth format" });
        }

        // Upload files
        let profilePictureUrl = null;
        let personalIdImageUrl = null;
        let portfolioUrls = [];
        const files = req.files;

        if (files?.profilePicture?.[0]) {
            const uploaded = await uploadToCloudinary(files.profilePicture[0].path, 'image');
            profilePictureUrl = uploaded;
        }

        if (files?.personalIdImage?.[0]) {
            const uploaded = await uploadToCloudinary(files.personalIdImage[0].path, 'image');
            personalIdImageUrl = uploaded;
        } else {
            return res.status(400).json({ message: "Personal ID image is required." });
        }

        if (files?.portfolio) {
            for (const file of files.portfolio) {
                const uploaded = await uploadToCloudinary(file.path, 'raw');
                portfolioUrls.push(uploaded);
            }
        }

        // Create freelancer
        const newFreelancer = new Freelancer({
            name,
            email: email.toLowerCase(),
            password,
            phone,
            dateOfBirth,
            profilePicture: profilePictureUrl,
            personalIdImage: personalIdImageUrl,
            portfolio: portfolioUrls
        });

        await newFreelancer.save();

        // Create wallet for the freelancer
        const wallet = new Wallet({
            owner: newFreelancer._id,
            ownerModel: "Freelancer",
            balance: 0
        });
        await wallet.save();

        res.status(201).json({
            message: "Freelancer registered successfully.",
            freelancer: newFreelancer,
            wallet
        });
    } catch (error) {
        console.error("Error adding freelancer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


/**-----------------------------------------
 *  @desc Freelancer Login
 * @route POST /api/freelancer/freelancer/login
 * @access Public
 ------------------------------------------*/
export const freelancerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Check if freelancer exists
        const freelancer = await Freelancer.findOne({ email: email.toLowerCase() });
        if (!freelancer) {
            return res.status(404).json({ message: "Freelancer not found" });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, freelancer.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!freelancer.verified) {
            return res.status(403).json({ message: "Your account is not verified. Please contact support." });
        }

        // Generate JWT token
        const token = jwt.sign({ id: freelancer._id, role: 'freelancer' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            message: "Login successful",
            token,
        });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

/**-----------------------------------------
 *  @desc Get All Freelancers
 * @route GET /api/freelancer
 * @access Private
 * @role Admin
 ------------------------------------------*/
export const getAllFreelancers = async (req, res) => {
    try {
        const freelancers = await Freelancer.find().select('-password');
        res.status(200).json(freelancers);
    } catch (error) {
        console.error("Error fetching freelancers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

/**-----------------------------------------
 *  @desc Get Freelancer by ID
 * @route GET /api/freelancer/:id
 ------------------------------------------*/
export const getFreelancerById = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if freelancer exists
        const freelancer = await Freelancer.findById(id).select('-password');
        if (!freelancer) {
            return res.status(404).json({ message: "Freelancer not found" });
        }

        res.status(200).json(freelancer);
    } catch (error) {
        console.error("Error fetching freelancer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

/**-----------------------------------------
 *  @desc Update Freelancer
 * @route PUT /api/freelancer/:id
 * @access Private
 * @role Freelancer, Admin
 ------------------------------------------*/
export const updateFreelancer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, dateOfBirth } = req.body;

        const updateFields = {};
        if (name) updateFields.name = name;
        if (email) {
            if (!helpers.validateEmail(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }
            updateFields.email = email.toLowerCase();
        }
        if (phone) {
            if (!helpers.validatePhone(phone)) {
                return res.status(400).json({ message: "Invalid phone number format" });
            }
            updateFields.phone = phone;
        }
        if (dateOfBirth) {
            if (!helpers.validateDOB(dateOfBirth)) {
                return res.status(400).json({ message: "Invalid date of birth format" });
            }
            updateFields.dateOfBirth = dateOfBirth;
        }

        // Upload profile picture if provided
        if (req.files?.profilePicture) {
            const profilePic = req.files.profilePicture[0];
            const profileUrl = await uploadToCloudinary(profilePic.path);
            updateFields.profilePicture = profileUrl;
        }

        // Upload personal ID image if provided
        if (req.files?.personalIdImage) {
            const idImage = req.files.personalIdImage[0];
            const idUrl = await uploadToCloudinary(idImage.path);
            updateFields.personalIdImage = idUrl;
        }

        // Upload portfolio PDF if provided
        if (req.files?.portfolio) {
            const pdf = req.files.portfolio[0];
            const pdfUrl = await uploadToCloudinary(pdf.path, "raw");
            updateFields.$push = { portfolio: pdfUrl };
        }

        const updatedFreelancer = await Freelancer.findByIdAndUpdate(id, updateFields, {
            new: true,
        });

        if (!updatedFreelancer) {
            return res.status(404).json({ message: "Freelancer not found" });
        }

        res.status(200).json({ message: "Freelancer updated successfully", freelancer: updatedFreelancer });
    } catch (error) {
        console.error("Error updating freelancer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**-----------------------------------------
 * @desc Send OTP for Freelancer
 * @route POST /api/freelancer/send-otp
 ------------------------------------------*/
export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const lowercaseEmail = email.toLowerCase();
        const freelancer = await Freelancer.findOne({ email: lowercaseEmail });

        if (!freelancer) {
            return res.status(404).json({ error: "freelancer not found" });
        }

        const otp = generateOTP();
        freelancer.otp = otp;
        freelancer.otpExpiresAt = getOTPExpiry();
        await freelancer.save();

        await sendOTPEmail({
            to: lowercaseEmail,
            otp,
            emailUser: process.env.EMAIL_FREELANCER,
        });

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ error: "Failed to send OTP. Please try again." });
    }
};

/**-----------------------------------------
 * @desc Verify OTP
 * @route POST /api/freelancer/verify-otp
 ------------------------------------------*/
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const lowercaseEmail = email.toLowerCase();
        const freelancer = await Freelancer.findOne({ email: lowercaseEmail });

        if (!freelancer) {
            return res.status(404).json({ error: "freelancer not found" });
        }

        if (!verifyOTPMatch(freelancer, otp)) {
            return res.status(401).json({ error: "Invalid OTP" });
        }

        res.status(200).json({ message: "OTP correct!" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**-----------------------------------------
 * @desc Update freelancer Password
 * @route PUT /api/freelancer/update-password
 ------------------------------------------*/
export const updateFreelancerPassword = async (req, res) => {
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
        const freelancer = await Freelancer.findOne({ email: lowercaseEmail });

        if (!freelancer) {
            return res.status(404).json({ error: 'freelancer not found' });
        }

        freelancer.password = newPassword; // hashing will happen automatically in pre-save

        await freelancer.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error('Password update error:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

/**-----------------------------------------
 *  @desc Toggle verification status of a freelancer
 * @route PUT /api/freelancer/:id/verify
 * @access Private
 * @role Admin
 ------------------------------------------*/
export const toggleFreelancerVerification = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if freelancer exists
        const freelancer = await Freelancer.findById(id);
        if (!freelancer) {
            return res.status(404).json({ message: "Freelancer not found" });
        }

        // Toggle verification status
        freelancer.verified = !freelancer.verified;
        await freelancer.save();

        // Send a mail notification
        const subject = freelancer.verified ? "Freelancer Verified" : "Freelancer Unverified";
        const text = `Dear ${freelancer.name},\n\nYour account has been ${freelancer.verified ? 'verified' : 'unverified'} by the admin.\n\nThank you!`;
        const mailOptions = {
            from: "Freelance Platform",
            to: freelancer.email,
            subject,
            text,
        };
        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: `Freelancer ${freelancer.verified ? 'verified' : 'unverified'} successfully`,
            freelancer
        });
    } catch (error) {
        console.error("Error toggling verification:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

/**-----------------------------------------
 *  @desc Delete Freelancer
 * @route DELETE /api/freelancer/:id
 * @access Private
 * @role Admin
 ------------------------------------------*/
export const deleteFreelancer = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if freelancer exists
        const freelancer = await Freelancer.findById(id);
        if (!freelancer) {
            return res.status(404).json({ message: "Freelancer not found" });
        }

        // Find all services that belong to this freelancer
        const services = await Service.find({ freelancer: id });

        // Loop through services and delete associated add-ons
        for (const service of services) {
            if (service.addOn?.length > 0) {
                await AddOn.deleteMany({ _id: { $in: service.addOn } });
            }
        }

        // Delete the services
        await Service.deleteMany({ freelancer: id });

        // Delete the freelancer's wallet
        const wallet = await Wallet.findOne({ owner: id, ownerModel: 'Freelancer' });
        if (wallet) {
            await Wallet.findByIdAndDelete(wallet._id);
        }

        // Delete the freelancer
        await Freelancer.findByIdAndDelete(id);

        res.status(200).json({
            message: "Freelancer, their services, add-ons, and wallet deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting freelancer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
