import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'fromModel',
  },
  fromModel: {
    type: String,
    enum: ['Admin', 'Freelancer', 'User'],
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'toModel',
  },
  toModel: {
    type: String,
    enum: ['Freelancer', 'Admin'],
  },
  type: {
    type: String,
    enum: ['Freelance Payment','User Payment'],
  },
  amount: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['card', 'paypal', 'visa'] },
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' },
  paidAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;