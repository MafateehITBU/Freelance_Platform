import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Service from '../models/Service.js';
import AddOn from '../models/AddOn.js';
import Wallet from '../models/Wallet.js';

/**-------------------------------------
 * @desc   Checkout Cart
 * @route  POST /api/transaction/checkout
 * @access Private
 * @role   User
 *---------------------------------------*/
export const checkoutCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fromModel, paymentMethod, status } = req.body;

        if (!fromModel || !paymentMethod || !status) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        if (!['card', 'paypal', 'visa'].includes(paymentMethod)) {
            return res.status(400).json({ message: "Invalid payment method" });
        }

        if (!['success', 'failed', 'pending'].includes(status)) {
            return res.status(400).json({ message: "Invalid payment status" });
        }

        const cart = await Cart.findOne({ userId }).populate('orders');
        if (!cart || cart.orders.length === 0) {
            return res.status(400).json({ message: "Your cart is empty" });
        }

        // Fetch the platform wallet (only one admin wallet assumed)
        const platformWallet = await Wallet.findOne({ ownerModel: 'Admin' });
        if (!platformWallet) {
            return res.status(404).json({ message: "Platform wallet not found" });
        }

        const purchasedOrders = [];
        let totalPaid = 0;

        for (const order of cart.orders) {
            const service = await Service.findById(order.serviceId);
            console.log(service);
            const addOns = await AddOn.find({ _id: { $in: order.selectedAddOn } });

            const addOnTotal = addOns.reduce((sum, a) => sum + a.price, 0);
            const amount = service.price + addOnTotal;

            // Create transaction for each order
            const transaction = new Transaction({
                from: userId,
                fromModel: fromModel,
                to: platformWallet.owner,
                toModel: 'Admin',
                type: 'User Payment',
                amount,
                paymentMethod,
                status,
            });
            const savedTransaction = await transaction.save();

            // Link transaction to order and save orderPrice
            order.transactionId = savedTransaction._id;
            order.orderPrice = amount;
            await order.save();

            purchasedOrders.push(order._id);
            totalPaid += amount;
        }

        if (status === 'failed') {
            return res.status(402).json({
                message: "Payment failed. Transactions recorded, but no orders were placed.",
                transactionsCreated: purchasedOrders.length,
                status
            });
        }

        // If payment was successful, increase platform wallet balance
        if (status === 'success') {
            const totalToAdd = totalPaid + (cart.platformFee || 0);

            platformWallet.balance += totalToAdd;
            await platformWallet.save();

            console.log(`[WALLET] Platform wallet updated. Added: ${totalToAdd}, New Balance: ${platformWallet.balance}`);
        }

        // Save order history and clear cart
        cart.history.push({
            orders: purchasedOrders,
            total: totalPaid + cart.platformFee,
            purchasedAt: new Date(),
        });

        cart.orders = [];
        cart.subtotal = 0;
        cart.total = 0;
        await cart.save();

        return res.status(200).json({
            message: "Checkout successful. Transactions created.",
            totalPaid,
            status
        });

    } catch (error) {
        console.error("Checkout error:", error);
        return res.status(500).json({
            message: "Failed to complete checkout",
            error: error.message,
        });
    }
};

/**-------------------------------------
 * @desc   Retry Failed Checkout
 * @route  POST /api/transaction/checkout/retry
 * @access Private
 * @role   User
 *---------------------------------------*/
export const retryFailedCheckout = async (req, res) => {
    try {
        const userId = req.user.id;
        const { paymentMethod } = req.body;

        if (!['card', 'paypal', 'visa'].includes(paymentMethod)) {
            return res.status(400).json({ message: "Invalid payment method" });
        }

        // Get failed orders for user that have a failed transaction
        const failedOrders = await Order.find({
            userId,
            transactionId: { $ne: null },
        }).populate('transactionId');

        const retryOrders = failedOrders.filter(order => order.transactionId.status === 'failed');

        if (retryOrders.length === 0) {
            return res.status(400).json({ message: "No failed transactions to retry" });
        }

        const platformWallet = await Wallet.findOne({ ownerModel: 'Admin' });
        if (!platformWallet) {
            return res.status(404).json({ message: "Platform wallet not found" });
        }

        let totalPaid = 0;
        const newTransactionIds = [];

        for (const order of retryOrders) {
            const amount = order.orderPrice;

            // Create new transaction with status = success
            const transaction = new Transaction({
                from: userId,
                fromModel: 'User',
                to: platformWallet.owner,
                toModel: 'Admin',
                type: 'Retry User Payment',
                amount,
                paymentMethod,
                status: 'success',
            });

            const savedTransaction = await transaction.save();

            // Update order with new transaction
            order.transactionId = savedTransaction._id;
            await order.save();

            newTransactionIds.push(savedTransaction._id);
            totalPaid += amount;
        }

        // Add to cart history
        const cart = await Cart.findOne({ userId });
        if (cart) {
            cart.history.push({
                orders: retryOrders.map(o => o._id),
                total: totalPaid + cart.platformFee,
                purchasedAt: new Date(),
            });

            await cart.save();
        }

        return res.status(200).json({
            message: "Retry successful",
            totalPaid,
            transactions: newTransactionIds,
        });

    } catch (error) {
        console.error("Retry checkout error:", error);
        return res.status(500).json({
            message: "Failed to retry checkout",
            error: error.message,
        });
    }
};

/**-------------------------------------
 * @desc   Get a user transactions
 * @route  POST /api/transaction
 * @access Private
 * @role   User
 *---------------------------------------*/
export const getUserTransactions = async (req, res) => {
    try {
        const userId = req.user.id;

        const transactions = await Transaction.find({ from: userId })
            .populate('from', 'name email')
            .populate('to', 'name email')
            .sort({ paidAt: -1 });

        res.status(200).json({ transactions });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch your transactions",
            error: error.message,
        });
    }
};

/**-------------------------------------
 * @desc   Get all trnsactions
 * @route  GET /api/transaction/admin
 * @access Private
 * @role   Admin
 *---------------------------------------*/
export const getAllTransactions = async (req, res) => {
    try {
        const { status, userId } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (userId) filter.user = userId;

        const transactions = await Transaction.find(filter)
            .populate('from', 'name email')
            .populate('to', 'name email')
            .sort({ paidAt: -1 });

        res.status(200).json({ transactions });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch transactions",
            error: error.message,
        });
    }
};

/**-------------------------------------
 * @desc   Get a Transaction by ID
 * @route  GET /api/transaction/:id
 * @access Private
 * @role   User, Admin
 *---------------------------------------*/
export const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id)
            .populate('from', 'name email')
            .populate('to', 'name email');
            
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        if (req.user.role !== 'admin' && transaction.user._id.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to view this transaction" });
        }

        res.status(200).json({ transaction });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch transaction",
            error: error.message,
        });
    }
};

/**-------------------------------------
 * @desc   Update Transaction status
 * @route  PUT /api/transaction/:id/status
 * @access Private
 * @role   Admin
 *---------------------------------------*/
export const updateTransactionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['success', 'failed', 'pending'].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        transaction.status = status;
        await transaction.save();

        res.status(200).json({ message: "Transaction status updated", transaction });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update transaction status",
            error: error.message,
        });
    }
};
