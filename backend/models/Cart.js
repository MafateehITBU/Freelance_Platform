import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    }],
    history: [{
        orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
        total: { type: Number, default: 0 },
        purchasedAt: { type: Date },
    }],
    subtotal: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;