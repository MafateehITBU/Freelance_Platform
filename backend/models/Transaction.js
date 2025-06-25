import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['card', 'paypal', 'visa'], required: true },
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' },
  paidAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;