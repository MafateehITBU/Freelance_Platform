import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['Basic', 'Pro', 'Premium'],
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    },
    features: {
        type: [String],
        default: []
    },
}, { timestamps: true });

const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
export default SubscriptionPlan;
