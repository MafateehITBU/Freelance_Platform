import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    }, 
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: true,
    },
    images: [{
        type: String,
    }],
    keywords: [{
        type: String,
    }],
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Freelancer',
        required: true,
    },
    expectedDeliveryTime: {
        type: Number, // in days
        required: true,
    },
    addOn: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AddOn'
    }],
    approved: {
        type: Boolean,
        default: false,
    },
},{
    timestamps: true,
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;