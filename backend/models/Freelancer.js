import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const freelancerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    profilePicture: {
        type: String,
    },
    personalIdImage: {
        type: String,
        required: true,
    },
    portfolio: [{
        type: String,
    }],
    verified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
        default: null,
    },
    otpExpiresAt: {
        type: Date,
        default: null,
    },
},{
    timestamps: true,
});

// Method to hash password before saving
freelancerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to add a profile picture if not set
freelancerSchema.pre('save', function (next) {
    const encodedName = encodeURIComponent(this.name);

    if (!this.profilePicture) {
        // If no profilePicture set at all
        this.profilePicture = `https://ui-avatars.com/api/?name=${encodedName}&size=128`;
    } else if (this.isModified('name') && this.profilePicture.includes('ui-avatars.com')) {
        // If name changed AND profilePicture is from ui-avatars, regenerate it
        this.profilePicture = `https://ui-avatars.com/api/?name=${encodedName}&size=128`;
    }

    next();
});

const Freelancer = mongoose.model('Freelancer', freelancerSchema);
export default Freelancer;