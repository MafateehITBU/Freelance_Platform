import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const influencerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
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
    subscription: {
        type: String,
    },
    socialMdeiaLinks: [{
        platform: {
            type: String,
            required: true,
            trim: true,
        },
        url: {
            type: String,
            required: true,
            trim: true,
        },
    }],
    verified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

influencerSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to add a profile picture if not set
influencerSchema.pre('save', function (next) {
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

const Influencer = mongoose.model("Influencer", influencerSchema);
export default Influencer;