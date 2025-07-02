import Admin from "../models/Admin.js";
import Freelancer from "../models/Freelancer.js";
import Wallet from "../models/Wallet.js";

/**-----------------------------------------
 *  @desc Get all wallets
 *  @route GET /api/wallet
 *  @access Private
 *  @role Admin
 ------------------------------------------*/
export const getAllWallets = async (req, res) => {
    try {
        const wallets = await Wallet.find();
        return res.status(200).json(wallets);
    } catch (error) {
        console.log("Error fetching wallets:", error);
        return res.status(500).json({ message: "Error getting all wallets" });
    }
};

/**-----------------------------------------
 *  @desc Get a wallet by ID
 *  @route GET /api/wallet/:walletId
 *  @access Private
 *  @role Admin, Freelancer
 ------------------------------------------*/
export const getWalletById = async (req, res) => {
    try {
        const { walletId } = req.params;
        const wallet = await Wallet.findById(walletId);
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found!" });
        }
        return res.status(200).json(wallet);
    } catch (error) {
        console.log("Error fetching the wallet by ID:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**-----------------------------------------
 *  @desc Get logged-in user wallet
 *  @route GET /api/wallet/user-wallet
 *  @access Private
 *  @role Admin, Freelancer
 ------------------------------------------*/
export const getUserWallet = async (req, res) => {
    try {
        const { userId, role } = req.user;

        let loggedInUser = null;
        if (role === 'admin') {
            loggedInUser = await Admin.findById(userId);
        } else if (role === 'freelancer') {
            loggedInUser = await Freelancer.findById(userId);
        } else {
            return res.status(403).json({ message: "User is not authorized to have a wallet!" });
        }

        if (!loggedInUser || !loggedInUser.walletId) {
            return res.status(404).json({ message: "Wallet not found!" });
        }

        const wallet = await Wallet.findById(loggedInUser.walletId);
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found!" });
        }

        return res.status(200).json(wallet);
    } catch (error) {
        console.log("Error fetching user wallet:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**-----------------------------------------
 *  @desc Update a wallet by ID
 *  @route PUT /api/wallet/:walletId
 *  @access Private
 *  @role Admin
 ------------------------------------------*/
export const updateWallet = async (req, res) => {
    try {
        const { walletId } = req.params;
        const { balance } = req.body;

        const wallet = await Wallet.findById(walletId);
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }

        wallet.balance = Number(balance);
        await wallet.save();

        return res.status(200).json({
            message: "Wallet updated successfully",
            wallet,
        });
    } catch (error) {
        console.log("Error updating the wallet:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
