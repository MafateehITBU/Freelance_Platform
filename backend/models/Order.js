import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Service', 
        required: true, 
    },
    selectedAddOn: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AddOn'
    }],
    freelancerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Freelancer', 
        required: true, 
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending',
    },
    ratingId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Rating' 
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Transaction'  
    }
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
export default Order;