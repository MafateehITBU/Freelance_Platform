import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    // This field is used if I want to populate subcategories later
    // It allows for easy retrieval of all subcategories under a category   
    subcategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory'
    }]
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
