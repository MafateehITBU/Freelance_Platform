import SubscriptionPlan from "../models/SubscriptionPlan.js";
import Admin from "../models/Admin.js";

/**-----------------------------------------
 *  @desc   Add Subscription Plan
 *  @route  POST /api/subscription-plan
 *  @access Private
 *  @role   Admin
 ------------------------------------------*/
export const addSubscriptionPlan = async (req, res) => {
    try {
        const { name, price, description, features } = req.body;
        const adminId = req.user.id;

        const validPlans = ['Basic', 'Pro', 'Premium'];

        // Validate required fields
        if (!name || !price || !description || !features) {
            return res.status(400).json({ message: "Please fill all required fields." });
        }

        // Check if the admin exists
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin does not exist" });
        }

        // Validate plan name
        if (!validPlans.includes(name)) {
            return res.status(400).json({
                message: `Plan name must be one of: ${validPlans.join(", ")}`
            });
        }

        // Convert the features to an array if it's a string
        const featuresArray = Array.isArray(features) ? features : features.split(',').map(feature => feature.trim());

        // Prevent duplicate plans (one entry per type)
        const existingPlan = await SubscriptionPlan.findOne({ name });
        if (existingPlan) {
            return res.status(409).json({ message: `${name} plan already exists.` });
        }

        // Create the new Plan
        const plan = new SubscriptionPlan({
            name,
            price: Number(price),
            description,
            features: featuresArray,
        });

        await plan.save();

        return res.status(201).json({
            message: "Subscription Plan created successfully",
            plan
        });
    } catch (error) {
        console.error("Error creating a subscription plan:", error);
        res.status(500).json({
            message: "Failed to create a subscription plan",
            error: error.message,
        });
    }
};

/**-----------------------------------------
 *  @desc   Get all Subscription Plans
 *  @route  GET /api/subscription-plan
 *  @access Private
 *  @role   Admin
 ------------------------------------------*/
export const getAllSubscriptionPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find();
        res.status(200).json(plans);
    } catch (error) {
        console.error("Error fetching subscription plans:", error);
        res.status(500).json({ message: "Failed to fetch plans", error: error.message });
    }
};

/**-----------------------------------------
 *  @desc   Get a Subscription Plan by ID
 *  @route  GET /api/subscription-plan/:id
 *  @access Private
 *  @role   Admin
 ------------------------------------------*/
export const getSubscriptionPlanById = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await SubscriptionPlan.findById(id);
        if (!plan) {
            return res.status(404).json({ message: "Subscription plan not found" });
        }
        res.status(200).json(plan);
    } catch (error) {
        console.error("Error fetching subscription plan:", error);
        res.status(500).json({ message: "Failed to fetch plan", error: error.message });
    }
};

/**-----------------------------------------
 *  @desc   Update a Subscription Plan by ID
 *  @route  PUT /api/subscription-plan/:id
 *  @access Private
 *  @role   Admin
 ------------------------------------------*/
export const updateSubscriptionPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, features } = req.body;

        const validPlans = ['Basic', 'Pro', 'Premium'];
        if (name && !validPlans.includes(name)) {
            return res.status(400).json({
                message: `Plan name must be one of: ${validPlans.join(", ")}`
            });
        }

        // update only the sent fields
        const updateFields = {};
        if (name) updateFields.name = name;
        if (price) updateFields.price = Number(price);
        if (description) updateFields.description = description;
        if (features) {
            // Convert the features to an array if it's a string
            updateFields.features = Array.isArray(features) ? features : features.split(',').map(feature => feature.trim());
        }
        // Find and update the plan
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }
        const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(id, updateFields, {
            new: true,  // return the updated document
            runValidators: true // validate the updated fields
        });

        if (!updatedPlan) {
            return res.status(404).json({ message: "Subscription plan not found" });
        }

        res.status(200).json({
            message: "Subscription plan updated successfully",
            plan: updatedPlan
        });
    } catch (error) {
        console.error("Error updating subscription plan:", error);
        res.status(500).json({ message: "Failed to update plan", error: error.message });
    }
};

/**-----------------------------------------
 *  @desc   Delete a Subscription Plan by ID
 *  @route  DELETE /api/subscription-plan/:id
 *  @access Private
 *  @role   Admin
 ------------------------------------------*/
export const deleteSubscriptionPlan = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedPlan = await SubscriptionPlan.findByIdAndDelete(id);
        if (!deletedPlan) {
            return res.status(404).json({ message: "Subscription plan not found" });
        }

        res.status(200).json({
            message: "Subscription plan deleted successfully",
            deletedPlan
        });
    } catch (error) {
        console.error("Error deleting subscription plan:", error);
        res.status(500).json({ message: "Failed to delete plan", error: error.message });
    }
};