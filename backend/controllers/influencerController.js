import Influencer from "../models/Influencer.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import Transaction from "../models/Transaction.js";
import Wallet from "../models/Wallet.js";
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
 *  @desc Add a new Influencer
 *  @route POST /api/influencer
 *  @access Public
 ------------------------------------------*/
export const addInfluencer = async (req, res) => {
    try {
        const { name, email, password, phone, dateOfBirth, socialMediaLinks } = req.body;

        // Validate required fields
        if (!name || !email || !password || !phone || !dateOfBirth) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if influencer already exists
        const existingInfluencer = await Influencer.findOne({ email: email.toLowerCase() });
        if (existingInfluencer) {
            return res.status(400).json({ message: "Influencer already exists" });
        }

        // Validate formats
        if (!helpers.validateEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (!helpers.validatePhone(phone)) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }
        if (!helpers.validateDOB(dateOfBirth)) {
            return res.status(400).json({ message: "Invalid date of birth format" });
        }

        // Handle image uploads
        let profilePictureUrl = null;
        let personalIdImageUrl = null;

        const files = req.files;

        if (files?.profilePicture?.[0]) {
            profilePictureUrl = await uploadToCloudinary(files.profilePicture[0].path, 'image');
        }

        if (files?.personalIdImage?.[0]) {
            personalIdImageUrl = await uploadToCloudinary(files.personalIdImage[0].path, 'image');
        } else {
            return res.status(400).json({ message: "Personal ID image is required." });
        }

        // Parse social media links safely
        let parsedSocialLinks = [];
        if (socialMediaLinks) {
            try {
                parsedSocialLinks = JSON.parse(socialMediaLinks);
                if (!Array.isArray(parsedSocialLinks)) {
                    return res.status(400).json({ message: "Social media links must be an array." });
                }
            } catch (err) {
                return res.status(400).json({ message: "Invalid JSON format for socialMediaLinks." });
            }
        }

        // Create and save influencer
        const newInfluencer = new Influencer({
            name,
            email: email.toLowerCase(),
            password,
            phone,
            dateOfBirth,
            profilePicture: profilePictureUrl,
            personalIdImage: personalIdImageUrl,
            socialMediaLinks: parsedSocialLinks,
        });

        await newInfluencer.save();

        res.status(201).json({
            message: "Influencer registered successfully.",
            influencer: newInfluencer
        });

    } catch (error) {
        console.error("Error adding influencer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**-----------------------------------------
 *  @desc Influencer Login
 * @route POST /api/Influencer/influencer/login
 * @access Public
 ------------------------------------------*/
export const influencerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Check if Influencer exists
        const influencer = await Influencer.findOne({ email: email.toLowerCase() });
        if (!influencer) {
            return res.status(404).json({ message: "Influencer not found" });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, influencer.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!influencer.verified) {
            return res.status(403).json({ message: "Your account is not verified. Please contact support." });
        }

        // Generate JWT token
        const token = jwt.sign({ id: influencer._id, role: 'influencer' }, process.env.JWT_SECRET, { expiresIn: '1d' });

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
 *  @desc Get All Influencer
 * @route GET /api/influencer
 * @access Private
 * @role Admin
 ------------------------------------------*/
export const getAllInfluencer = async (req, res) => {
    try {
        const influencer = await Influencer.find().select('-password');
        res.status(200).json(influencer);
    } catch (error) {
        console.error("Error fetching Influencer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

/**-----------------------------------------
 *  @desc Get Influencer by ID
 * @route GET /api/influencer/:id
 ------------------------------------------*/
export const getInfluencerById = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if Influencer exists
        const influencer = await Influencer.findById(id).select('-password');
        if (!influencer) {
            return res.status(404).json({ message: "Influencer not found" });
        }

        res.status(200).json(influencer);
    } catch (error) {
        console.error("Error fetching Influencer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

/**-----------------------------------------
 *  @desc Update Influencer
 * @route PUT /api/influencer/:id
 * @access Private
 * @role Influencer, Admin
 ------------------------------------------*/
export const updateInfluencer = async (req, res) => {
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

        const updatedInfluencer = await Influencer.findByIdAndUpdate(id, updateFields, {
            new: true,
        });

        if (!updatedInfluencer) {
            return res.status(404).json({ message: "Influencer not found" });
        }

        res.status(200).json({ message: "Influencer updated successfully", Influencer: updatedInfluencer });
    } catch (error) {
        console.error("Error updating Influencer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**-----------------------------------------
 *  @desc   Subscribe influencer to a plan
 *  @route  PUT /api/influencer/subscribe/:subscriptionPlanId
 *  @access Private
 *  @role   Influencer
 ------------------------------------------*/
export const subscribeToPlan = async (req, res) => {
    try {
        const influencerId = req.user.id;
        const { subscriptionPlanId } = req.params;
        const { paymentMethod, status } = req.body;

        if (!paymentMethod || !status) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        if (!['card', 'paypal', 'visa'].includes(paymentMethod)) {
            return res.status(400).json({ message: "Invalid payment method" });
        }

        if (!['success', 'failed', 'pending'].includes(status)) {
            return res.status(400).json({ message: "Invalid payment status" });
        }

        // Check if influencer exists
        const influencer = await Influencer.findById(influencerId);
        if (!influencer) {
            return res.status(404).json({ message: "Influencer not found" });
        }

        // Check if plan exists
        const plan = await SubscriptionPlan.findById(subscriptionPlanId);
        if (!plan) {
            return res.status(404).json({ message: "Subscription plan not found" });
        }

        // Get Platform Wallet
        const adminWallet = await Wallet.findOne({ ownerModel: 'Admin' });
        if (!adminWallet) {
            return res.status(404).json({ message: "Platform wallet not found" });
        }

        // Create transaction
        const transaction = new Transaction({
            from: influencerId,
            fromModel: "Influencer",
            to: adminWallet.owner,
            toModel: 'Admin',
            type: 'Subscription',
            amount: plan.price,
            paymentMethod,
            status,
        });

        await transaction.save();

        let now = null;
        let oneMonthLater = null;

        if (status !== 'failed') {
            now = new Date();
            oneMonthLater = new Date(now);
            oneMonthLater.setMonth(now.getMonth() + 1);

            // Update subscription details
            influencer.subscriptionActive = true;
            influencer.subscriptionPlan = plan._id;
            influencer.subscriptionStartDate = now;
            influencer.subscriptionEndDate = oneMonthLater;

            await influencer.save();

            adminWallet.balance += plan.price;
            adminWallet.save();
        }

        res.status(200).json({
            message: `Subscription process complete. Status: ${status}`,
            subscription: {
                plan: plan.name,
                startDate: now,
                endDate: oneMonthLater,
            },
        });

    } catch (error) {
        console.error("Error subscribing influencer:", error);
        res.status(500).json({
            message: "Failed to subscribe influencer",
            error: error.message,
        });
    }
};

/**-----------------------------------------
 * @desc Send OTP for Influencer
 * @route POST /api/influencer/send-otp
 ------------------------------------------*/
export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const lowercaseEmail = email.toLowerCase();
        const influencer = await Influencer.findOne({ email: lowercaseEmail });

        if (!influencer) {
            return res.status(404).json({ error: "Influencer not found" });
        }

        const otp = generateOTP();
        influencer.otp = otp;
        influencer.otpExpiresAt = getOTPExpiry();
        await influencer.save();

        await sendOTPEmail({
            to: lowercaseEmail,
            otp,
            emailUser: process.env.EMAIL_Influencer,
        });

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ error: "Failed to send OTP. Please try again." });
    }
};

/**-----------------------------------------
 * @desc Verify OTP
 * @route POST /api/influencer/verify-otp
 ------------------------------------------*/
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const lowercaseEmail = email.toLowerCase();
        const influencer = await Influencer.findOne({ email: lowercaseEmail });

        if (!influencer) {
            return res.status(404).json({ error: "Influencer not found" });
        }

        if (!verifyOTPMatch(influencer, otp)) {
            return res.status(401).json({ error: "Invalid OTP" });
        }

        res.status(200).json({ message: "OTP correct!" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**-----------------------------------------
 * @desc Update Influencer Password
 * @route PUT /api/influencer/update-password
 ------------------------------------------*/
export const updateInfluencerPassword = async (req, res) => {
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
        const influencer = await Influencer.findOne({ email: lowercaseEmail });

        if (!influencer) {
            return res.status(404).json({ error: 'Influencer not found' });
        }

        influencer.password = newPassword; // hashing will happen automatically in pre-save

        await influencer.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error('Password update error:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

/**-----------------------------------------
 *  @desc Toggle verification status of a Influencer
 * @route PUT /api/influencer/:id/verify
 * @access Private
 * @role Admin
 ------------------------------------------*/
export const toggleInfluencerVerification = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if Influencer exists
        const influencer = await Influencer.findById(id);
        if (!influencer) {
            return res.status(404).json({ message: "Influencer not found" });
        }

        // Toggle verification status
        influencer.verified = !influencer.verified;
        await influencer.save();

        // Send a mail notification
        const subject = influencer.verified ? "Influencer Verified" : "Influencer Unverified";
        const text = `Dear ${influencer.name},\n\nYour account has been ${influencer.verified ? 'verified' : 'unverified'} by the admin.\n\nThank you!`;
        const mailOptions = {
            from: "Freelance Platform",
            to: influencer.email,
            subject,
            text,
        };
        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: `Influencer ${influencer.verified ? 'verified' : 'unverified'} successfully`,
            influencer
        });
    } catch (error) {
        console.error("Error toggling verification:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

/**-----------------------------------------
 *  @desc Delete Influencer
 * @route DELETE /api/influencer/:id
 * @access Private
 * @role Admin
 ------------------------------------------*/
export const deleteInfluencer = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if Influencer exists
        const influencer = await Influencer.findById(id);
        if (!influencer) {
            return res.status(404).json({ message: "Influencer not found" });
        }

        // Delete Influencer
        await Influencer.findByIdAndDelete(id);

        res.status(200).json({ message: "Influencer deleted successfully" });
    } catch (error) {
        console.error("Error deleting Influencer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}