import Cart from "../models/Cart.js";
import Service from "../models/Service.js";
import AddOn from "../models/AddOn.js";
import Order from "../models/Order.js";

/**-------------------------------------
 * @desc   Get User Cart
 * @route  Get /api/cart
 * @access Private
 * @role   User
 *---------------------------------------*/
export const getUserCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id })
            .populate({
                path: 'orders',
                populate: {
                    path: 'serviceId selectedAddOn',
                },
            });

        if (!cart) {
            return res.status(404).json({ message: "Cart is empty" });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch cart", error: error.message });
    }
};

/**-------------------------------------
 * @desc   Get Cart history
 * @route  POST /api/cart
 * @access Private
 * @role   User
 *---------------------------------------*/
export const getCartHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId })
            .populate({
                path: 'history.orders',
                populate: {
                    path: 'serviceId selectedAddOn',
                },
            });

        if (!cart || cart.history.length === 0) {
            return res.status(404).json({ message: "No cart history found" });
        }

        return res.status(200).json({
            message: "Cart history fetched successfully",
            history: cart.history,
        });
    } catch (error) {
        console.error("Error fetching cart history:", error);
        return res.status(500).json({
            message: "Failed to fetch cart history",
            error: error.message,
        });
    }
};

/**-------------------------------------
 * @desc   Update Cart platform fee
 * @route  POST /api/cart/platform-fee
 * @access Private
 * @role   Admin
 *---------------------------------------*/
export const updatePlatformFee = async (req, res) => {
    try {
        const { platformFee } = req.body;

        if (platformFee == null || platformFee < 0) {
            return res.status(400).json({ message: "A valid platform fee is required" });
        }

        // Fetch all carts
        const carts = await Cart.find().populate('orders');

        for (const cart of carts) {
            let subtotal = 0;

            for (const order of cart.orders) {
                const service = await Service.findById(order.serviceId);
                const addOns = await AddOn.find({ _id: { $in: order.selectedAddOn } });

                const addOnTotal = addOns.reduce((sum, a) => sum + a.price, 0);
                subtotal += service.price + addOnTotal;
            }

            cart.subtotal = subtotal;
            cart.platformFee = platformFee;
            cart.total = subtotal + platformFee;

            await cart.save();
        }

        res.status(200).json({
            message: `Platform fee updated to ${platformFee} for all carts.`,
        });
    } catch (error) {
        console.error("Failed to update platform fee globally:", error);
        res.status(500).json({
            message: "Failed to update platform fee for all carts",
            error: error.message,
        });
    }
};

/**-------------------------------------
 * @desc   Clear Cart
 * @route  PUT /api/cart/clear-cart
 * @access Private
 * @role   User
 *---------------------------------------*/
export const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        // delete associated orders
        await Order.deleteMany({ _id: { $in: cart.orders } });

        cart.orders = [];
        cart.subtotal = 0;
        cart.total = cart.platformFee;
        await cart.save();

        res.status(200).json({ message: "Cart cleared", cart });
    } catch (error) {
        res.status(500).json({ message: "Failed to clear cart", error: error.message });
    }
};
