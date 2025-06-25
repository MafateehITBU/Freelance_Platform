import Order from '../models/Order.js';
import Service from '../models/Service.js';
import AddOn from '../models/AddOn.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';

/**-------------------------------------
 * @desc   Add a new order
 * @route  POST /api/order
 * @access Private
 * @role   User
 *---------------------------------------*/
export const addOrder = async (req, res) => {
    try {
        const { serviceId, selectedAddOn } = req.body;
        const userId = req.user.id;

        // Validate required field
        if (!serviceId) {
            return res.status(400).json({ message: "Service is required!" });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if service exists
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        const freelancerId = service.freelancer;

        // Check if freelancer has an order that is not complete
        const activeOrder = await Order.findOne({
            freelancerId,
            status: "In Progress"
        });

        if (activeOrder) {
            return res.status(409).json({
                message: "This freelancer is currently working on another order. Please try again later or choose another freelancer.",
            });
        }

        // Parse selectedAddOn
        let parsedAddOns = [];
        if (selectedAddOn) {
            try {
                parsedAddOns = JSON.parse(selectedAddOn);
                if (!Array.isArray(parsedAddOns)) {
                    return res.status(400).json({ message: "Add Ons must be an array." });
                }
            } catch (err) {
                return res.status(400).json({ message: "Invalid JSON format for selectedAddOn." });
            }
        }

        // Fetch add-ons and calculate total
        let addOnsFromDB = [];
        let addOnsTotalPrice = 0;

        if (parsedAddOns.length > 0) {
            addOnsFromDB = await AddOn.find({ _id: { $in: parsedAddOns } });

            if (addOnsFromDB.length !== parsedAddOns.length) {
                return res.status(404).json({ message: "One or more add-ons not found" });
            }

            addOnsTotalPrice = addOnsFromDB.reduce((sum, addOn) => sum + addOn.price, 0);
        }

        // Create new order
        const order = new Order({
            userId,
            serviceId,
            selectedAddOn: parsedAddOns,
            freelancerId,
        });

        const createdOrder = await order.save();

        // Add order to cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({
                userId,
                orders: [],
                subtotal: 0,
                platformFee: 5,
                total: 0,
            });
        }

        cart.orders.push(createdOrder._id);
        cart.subtotal += service.price + addOnsTotalPrice;
        cart.total = cart.subtotal + cart.platformFee;

        await cart.save();

        return res.status(201).json({
            message: "Order added successfully",
            order: createdOrder,
            cart,
        });

    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({
            message: "Failed to add order",
            error: error.message,
        });
    }
};

/**-------------------------------------
 * @desc   Get All Orders for a user
 * @route  GET /api/order
 * @access Private
 * @role   User
 *---------------------------------------*/
export const getAllUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await Order.find({ userId })
            .populate('userId', 'name')
            .populate('serviceId', 'title description price')
            .populate('selectedAddOn');

        res.status(200).json({ orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({
            message: "Failed to fetch orders",
            error: error.message,
        });
    }
};

/**-------------------------------------
 * @desc   Get an Order by ID
 * @route  GET /api/order/:orderId
 * @access Private
 * @role   User, Admin
 *---------------------------------------*/
export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({ _id: orderId })
            .populate('serviceId')
            .populate('selectedAddOn');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ order });
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({
            message: "Failed to fetch order",
            error: error.message,
        });
    }
};


/**-------------------------------------
 * @desc   Update an Order
 * @route  PUT /api/order/:orderId
 * @access Private
 * @role   User
 *---------------------------------------*/
export const updateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { selectedAddOn } = req.body;
        const userId = req.user.id;

        const order = await Order.findOne({ _id: orderId, userId }).populate('serviceId');
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Parse new add-ons
        let parsedAddOns = [];
        if (selectedAddOn) {
            try {
                parsedAddOns = JSON.parse(selectedAddOn);
                if (!Array.isArray(parsedAddOns)) {
                    return res.status(400).json({ message: "Add Ons must be an array." });
                }
            } catch (err) {
                return res.status(400).json({ message: "Invalid JSON format for selectedAddOn." });
            }
        }

        // Fetch updated add-ons
        const addOnsFromDB = await AddOn.find({ _id: { $in: parsedAddOns } });
        if (addOnsFromDB.length !== parsedAddOns.length) {
            return res.status(404).json({ message: "One or more add-ons not found" });
        }

        const oldAddOns = await AddOn.find({ _id: { $in: order.selectedAddOn } });
        const oldAddOnsTotal = oldAddOns.reduce((sum, a) => sum + a.price, 0);
        const newAddOnsTotal = addOnsFromDB.reduce((sum, a) => sum + a.price, 0);

        // Update cart
        const cart = await Cart.findOne({ userId });
        if (cart) {
            cart.subtotal = cart.subtotal - oldAddOnsTotal + newAddOnsTotal;
            cart.total = cart.subtotal + cart.platformFee;
            await cart.save();
        }

        // Update order
        order.selectedAddOn = parsedAddOns;
        await order.save();

        res.status(200).json({ message: "Order updated", order });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({
            message: "Failed to update order",
            error: error.message,
        });
    }
};

/**-------------------------------------
 * @desc   Delete an Order
 * @route  DELETE /api/order/:orderId
 * @access Private
 * @role   User
 *---------------------------------------*/
export const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await Order.findOne({ _id: orderId, userId }).populate('serviceId selectedAddOn');
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.status !== 'Pending') {
            return res.status(400).json({ message: "Can't delete the order unless it's Pending" });
        }

        const cart = await Cart.findOne({ userId });
        if (cart) {
            // remove order from cart
            cart.orders = cart.orders.filter(id => id.toString() !== order._id.toString());

            // subtract prices
            const servicePrice = order.serviceId.price || 0;
            const addOnsPrice = order.selectedAddOn.reduce((sum, a) => sum + (a.price || 0), 0);

            cart.subtotal -= servicePrice + addOnsPrice;
            cart.subtotal = Math.max(0, cart.subtotal);
            cart.total = cart.subtotal + cart.platformFee;

            await cart.save();
        }

        await order.deleteOne();

        res.status(200).json({ message: "Order deleted" });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({
            message: "Failed to delete order",
            error: error.message,
        });
    }
};
