import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
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
    billingDetails: [{
        cardNumber: {
            type: String,
            required: true,
        },
        expiryDate: {
            type: String,
            required: true,
        },
        cvv: {
            type: String,
            required: true,
        },
        cardHolderName: {
            type: String,
            required: true,
        },
    }],
    servicesTaken: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }],
}, {
    timestamps: true,
});

// Method to hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.pre('save', function (next) {
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

const User = mongoose.model('User', userSchema);
export default User;