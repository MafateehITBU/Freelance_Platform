import mongoose from "mongoose";

const addOnSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    duration: {
        type: Number, // in days
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
},{
    timestamps: true,
});

const AddOn = mongoose.model('AddOn', addOnSchema);
export default AddOn;