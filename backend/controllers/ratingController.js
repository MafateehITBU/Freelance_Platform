import Rating from '../models/Rating.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

/**-------------------------------------
 * @desc   Add a new rating
 * @route  POST /api/rating
 * @access Private
 * @role   User
 *---------------------------------------*/
export const addRating = async (req, res) => {
    try {
        const { rate, comment, orderId } = req.body;
        const userId = req.user.id;

        // Validate inputs
        if (!rate || !comment || !orderId) {
            return res.status(400).json({ message: "Rate, comment, and order ID are required." });
        }

        // Confirm user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Confirm order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (userId !== order.userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to rate this order." });
        }

        // Prevent rating if already added
        if (order.ratingId) {
            return res.status(400).json({ message: "Rating already exists for this order" });
        }

        // Allow rating only if order is completed
        if (order.status !== 'Completed') {
            return res.status(400).json({ message: "You can't rate an order unless it's completed." });
        }

        // Create and save the rating
        const rating = new Rating({
            userId,
            freelancerId: order.freelancerId,
            rate,
            comment,
        });

        const savedRating = await rating.save();

        // Attach rating to order
        order.ratingId = savedRating._id;
        await order.save();

        res.status(201).json({
            message: "Rating added successfully",
            rating: savedRating,
        });

    } catch (error) {
        console.error("Error adding rating:", error);
        res.status(500).json({
            message: "Failed to create rating",
            error: error.message,
        });
    }
};

/**-------------------------------------
 * @desc   Get all ratings for a freelancer
 * @route  GET /api/rating/freelancer/:freelancerId
 * @access Public
 *---------------------------------------*/
export const getRatingsForFreelancer = async (req, res) => {
    try {
        const { freelancerId } = req.params;

        const ratings = await Rating.find({ freelancerId })
            .populate('userId', 'name') // show user info
            .sort({ createdAt: -1 });

        res.status(200).json({ ratings });
    } catch (error) {
        console.error("Error fetching ratings:", error);
        res.status(500).json({ message: "Failed to get ratings", error: error.message });
    }
};

/**-------------------------------------
 * @desc   Get a rating by ID
 * @route  GET /api/rating/:id
 * @access Public
 *---------------------------------------*/
export const getRatingById = async (req, res) => {
    try {
        const { id } = req.params;

        const rating = await Rating.findById(id)
            .populate('userId', 'name email')
            .populate('freelancerId', 'name');

        if (!rating) {
            return res.status(404).json({ message: "Rating not found" });
        }

        res.status(200).json({ rating });
    } catch (error) {
        res.status(500).json({ message: "Failed to get rating", error: error.message });
    }
};

/**-------------------------------------
 * @desc   Update a rating
 * @route  PUT /api/rating/:id
 * @access Private
 * @role   User
 *---------------------------------------*/
export const updateRating = async (req, res) => {
    try {
        const { id } = req.params;
        const { rate, comment } = req.body;
        const userId = req.user.id;

        const rating = await Rating.findById(id);

        if (!rating) {
            return res.status(404).json({ message: "Rating not found" });
        }

        if (rating.userId.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this rating" });
        }

        if (rate) rating.rate = rate;
        if (comment) rating.comment = comment;

        const updatedRating = await rating.save();

        res.status(200).json({ message: "Rating updated", rating: updatedRating });
    } catch (error) {
        console.error("Error updating rating:", error);
        res.status(500).json({ message: "Failed to update rating", error: error.message });
    }
};

/**-------------------------------------
 * @desc   Delete a rating
 * @route  DELETE /api/rating/:id
 * @access Private
 * @role   Admin, User
 *---------------------------------------*/
export const deleteRating = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const rating = await Rating.findById(id);
        if (!rating) {
            return res.status(404).json({ message: "Rating not found" });
        }

        if (
            rating.userId.toString() !== userId &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ message: "Not authorized to delete this rating" });
        }

        await rating.deleteOne();

        // remove from order
        await Order.updateOne({ ratingId: id }, { $unset: { ratingId: "" } });

        res.status(200).json({ message: "Rating deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete rating", error: error.message });
    }
};

